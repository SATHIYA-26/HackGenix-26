"""YouTube Live Comments & Feedback Ingestion Service.

Fetches live comments and full nested replies from any YouTube Video URL
or Channel Handle via YouTube Data API v3, transforms them into canonical
FeedbackInput, and triggers the NLP + Intelligence pipeline.
"""

import os
import re
import urllib.parse
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional
import httpx
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.logging import logger
from app.schemas.feedback import FeedbackInput
from app.connectors.registry import connector_registry
from app.db.repositories.feedback_repository import FeedbackRepository
from app.nlp.pipeline import NLPPipeline
from app.intelligence.insight_engine import IntelligenceCoordinator

YOUTUBE_API_BASE = "https://www.googleapis.com/youtube/v3"


class YouTubeLiveService:
    """Service to fetch real-time YouTube comments and route them into the feedback intelligence pipeline."""

    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or settings.YOUTUBE_API_KEY
        if not self.api_key:
            raise ValueError("YouTube API key is missing. Set YOUTUBE_API_KEY in environment or pass directly.")

    @staticmethod
    def extract_video_id(video_input: str) -> str:
        """Extract 11-char video ID from standard URLs, short URLs, shorts, or raw ID."""
        video_input = video_input.strip()
        if len(video_input) == 11 and re.match(r"^[a-zA-Z0-9_-]{11}$", video_input):
            return video_input

        patterns = [
            r"(?:v=|\/)([0-9A-Za-z_-]{11}).*",
            r"(?:shorts\/)([0-9A-Za-z_-]{11})",
            r"(?:embed\/)([0-9A-Za-z_-]{11})",
        ]
        for p in patterns:
            match = re.search(p, video_input)
            if match:
                return match.group(1)
        return video_input

    @staticmethod
    def extract_channel_handle(channel_input: str) -> str:
        """Extract channel handle from full URL or handle string."""
        channel_input = channel_input.strip()
        if channel_input.startswith("@"):
            return channel_input
        if "youtube.com/" in channel_input:
            parsed = urllib.parse.urlparse(channel_input)
            path = parsed.path.strip("/")
            if path.startswith("@"):
                return path
            if "/" in path:
                return path.split("/")[-1]
            return path
        return channel_input if channel_input.startswith("@") else f"@{channel_input}"

    def fetch_video_details(self, client: httpx.Client, video_id: str) -> Dict[str, Any]:
        """Fetches video title, channel title, view count, and statistics."""
        url = f"{YOUTUBE_API_BASE}/videos"
        params = {
            "part": "snippet,statistics",
            "id": video_id,
            "key": self.api_key,
        }
        resp = client.get(url, params=params)
        if resp.status_code != 200:
            return {"title": f"Video {video_id}", "channelTitle": "Unknown Channel", "views": 0, "commentCount": 0}
        data = resp.json()
        items = data.get("items", [])
        if not items:
            return {"title": f"Video {video_id}", "channelTitle": "Unknown Channel", "views": 0, "commentCount": 0}
        snippet = items[0].get("snippet", {})
        stats = items[0].get("statistics", {})
        return {
            "title": snippet.get("title", ""),
            "channelTitle": snippet.get("channelTitle", ""),
            "publishedAt": snippet.get("publishedAt", ""),
            "viewCount": int(stats.get("viewCount", 0)),
            "likeCount": int(stats.get("likeCount", 0)),
            "commentCount": int(stats.get("commentCount", 0)),
        }

    def fetch_all_replies_for_thread(
        self,
        client: httpx.Client,
        parent_id: str,
        video_id: str,
        video_meta: Dict[str, Any],
    ) -> List[Dict[str, Any]]:
        """Fetches all nested replies for a given top-level comment thread."""
        replies = []
        page_token = None
        url = f"{YOUTUBE_API_BASE}/comments"

        while True:
            params = {
                "part": "snippet",
                "parentId": parent_id,
                "maxResults": 100,
                "textFormat": "plainText",
                "key": self.api_key,
            }
            if page_token:
                params["pageToken"] = page_token

            resp = client.get(url, params=params)
            if resp.status_code != 200:
                break

            data = resp.json()
            items = data.get("items", [])
            if not items:
                break

            for rep in items:
                rep_snippet = rep.get("snippet", {})
                rep_id = rep.get("id", "")
                rep_text = rep_snippet.get("textOriginal") or rep_snippet.get("textDisplay") or ""
                if rep_text.strip():
                    replies.append({
                        "id": f"yt_{rep_id}",
                        "source": "youtube",
                        "source_type": "reply",
                        "parent_id": f"yt_{parent_id}",
                        "text": rep_text.strip(),
                        "author": rep_snippet.get("authorDisplayName", "Anonymous"),
                        "author_avatar": rep_snippet.get("authorProfileImageUrl", ""),
                        "like_count": rep_snippet.get("likeCount", 0),
                        "created_at": rep_snippet.get("publishedAt", ""),
                        "updated_at": rep_snippet.get("updatedAt", ""),
                        "video_id": video_id,
                        "video_title": video_meta.get("title", ""),
                        "channel_title": video_meta.get("channelTitle", ""),
                        "source_url": f"https://www.youtube.com/watch?v={video_id}&lc={rep_id}",
                        "is_reply": True,
                    })

            page_token = data.get("nextPageToken")
            if not page_token:
                break

        return replies

    def fetch_comments_for_video(
        self,
        client: httpx.Client,
        video_id: str,
        max_comments: Optional[int] = 100,
    ) -> List[Dict[str, Any]]:
        """Fetches all top-level comments and full replies for a video."""
        comments = []
        seen_ids = set()
        page_token = None
        url = f"{YOUTUBE_API_BASE}/commentThreads"

        video_meta = self.fetch_video_details(client, video_id)
        stat_total = video_meta.get("commentCount", 0)
        logger.info(f"Fetching comments for video: '{video_meta['title']}' (Header Count: {stat_total})...")

        while True:
            if max_comments is not None and len(comments) >= max_comments:
                break

            fetch_limit = 100
            if max_comments is not None:
                fetch_limit = min(100, max_comments - len(comments))

            params = {
                "part": "snippet,replies",
                "videoId": video_id,
                "maxResults": fetch_limit,
                "textFormat": "plainText",
                "key": self.api_key,
            }
            if page_token:
                params["pageToken"] = page_token

            resp = client.get(url, params=params)

            if resp.status_code == 403:
                err_data = resp.json().get("error", {})
                reasons = [e.get("reason") for e in err_data.get("errors", [])]
                if "commentsDisabled" in reasons:
                    logger.warning(f"Comments are disabled on video {video_id}.")
                    break
                if "quotaExceeded" in reasons:
                    raise Exception("YouTube Data API Quota Exceeded for today.")
                raise Exception(f"YouTube API Forbidden (403): {resp.text}")

            if resp.status_code == 404:
                logger.warning(f"Video {video_id} not found.")
                break

            if resp.status_code != 200:
                raise Exception(f"YouTube API Error ({resp.status_code}): {resp.text}")

            data = resp.json()
            items = data.get("items", [])
            if not items:
                break

            for item in items:
                top_snippet = item.get("snippet", {}).get("topLevelComment", {}).get("snippet", {})
                top_id = item.get("snippet", {}).get("topLevelComment", {}).get("id", "")
                top_text = top_snippet.get("textOriginal") or top_snippet.get("textDisplay") or ""
                total_replies = item.get("snippet", {}).get("totalReplyCount", 0)

                if top_text.strip() and top_id not in seen_ids:
                    seen_ids.add(top_id)
                    comments.append({
                        "id": f"yt_{top_id}",
                        "source": "youtube",
                        "source_type": "comment",
                        "text": top_text.strip(),
                        "author": top_snippet.get("authorDisplayName", "Anonymous"),
                        "author_avatar": top_snippet.get("authorProfileImageUrl", ""),
                        "like_count": top_snippet.get("likeCount", 0),
                        "created_at": top_snippet.get("publishedAt", ""),
                        "updated_at": top_snippet.get("updatedAt", ""),
                        "video_id": video_id,
                        "video_title": video_meta.get("title", ""),
                        "channel_title": video_meta.get("channelTitle", ""),
                        "source_url": f"https://www.youtube.com/watch?v={video_id}&lc={top_id}",
                        "is_reply": False,
                        "reply_count": total_replies,
                        "metadata": {
                            "video_id": video_id,
                            "video_title": video_meta.get("title", ""),
                            "channel_title": video_meta.get("channelTitle", ""),
                            "author": top_snippet.get("authorDisplayName", "Anonymous"),
                            "like_count": top_snippet.get("likeCount", 0),
                        }
                    })

                # Fetch nested replies
                replies_data = item.get("replies", {}).get("comments", [])
                if total_replies > len(replies_data):
                    full_replies = self.fetch_all_replies_for_thread(client, top_id, video_id, video_meta)
                    for rep in full_replies:
                        if rep["id"] not in seen_ids:
                            seen_ids.add(rep["id"])
                            comments.append(rep)
                else:
                    for rep in replies_data:
                        rep_snippet = rep.get("snippet", {})
                        rep_id = rep.get("id", "")
                        rep_text = rep_snippet.get("textOriginal") or rep_snippet.get("textDisplay") or ""
                        if rep_text.strip() and rep_id not in seen_ids:
                            seen_ids.add(rep_id)
                            comments.append({
                                "id": f"yt_{rep_id}",
                                "source": "youtube",
                                "source_type": "reply",
                                "parent_id": f"yt_{top_id}",
                                "text": rep_text.strip(),
                                "author": rep_snippet.get("authorDisplayName", "Anonymous"),
                                "author_avatar": rep_snippet.get("authorProfileImageUrl", ""),
                                "like_count": rep_snippet.get("likeCount", 0),
                                "created_at": rep_snippet.get("publishedAt", ""),
                                "updated_at": rep_snippet.get("updatedAt", ""),
                                "video_id": video_id,
                                "video_title": video_meta.get("title", ""),
                                "channel_title": video_meta.get("channelTitle", ""),
                                "source_url": f"https://www.youtube.com/watch?v={video_id}&lc={rep_id}",
                                "is_reply": True,
                                "metadata": {
                                    "video_id": video_id,
                                    "video_title": video_meta.get("title", ""),
                                    "channel_title": video_meta.get("channelTitle", ""),
                                    "author": rep_snippet.get("authorDisplayName", "Anonymous"),
                                    "like_count": rep_snippet.get("likeCount", 0),
                                    "parent_id": f"yt_{top_id}",
                                }
                            })

            page_token = data.get("nextPageToken")
            if not page_token:
                break

        return comments

    def fetch_channel_videos(
        self,
        client: httpx.Client,
        channel_handle_or_id: str,
        max_videos: int = 5,
    ) -> List[Dict[str, Any]]:
        """Resolves channel handle/ID and fetches uploaded video IDs."""
        search_url = f"{YOUTUBE_API_BASE}/search"
        search_params = {
            "part": "snippet",
            "q": channel_handle_or_id,
            "type": "channel",
            "maxResults": 1,
            "key": self.api_key,
        }
        search_resp = client.get(search_url, params=search_params)
        if search_resp.status_code != 200:
            raise Exception(f"Failed to lookup channel: {search_resp.text}")

        search_data = search_resp.json()
        items = search_data.get("items", [])
        if not items:
            raise Exception(f"No YouTube channel found for '{channel_handle_or_id}'.")

        channel_id = items[0]["snippet"]["channelId"]
        channel_title = items[0]["snippet"]["title"]

        video_search_params = {
            "part": "snippet",
            "channelId": channel_id,
            "type": "video",
            "order": "date",
            "maxResults": min(max_videos, 25),
            "key": self.api_key,
        }
        video_resp = client.get(search_url, params=video_search_params)
        if video_resp.status_code != 200:
            raise Exception(f"Failed to fetch channel videos: {video_resp.text}")

        video_items = video_resp.json().get("items", [])
        videos = []
        for item in video_items:
            vid_id = item["id"].get("videoId")
            if vid_id:
                videos.append({
                    "video_id": vid_id,
                    "title": item["snippet"].get("title", ""),
                    "publishedAt": item["snippet"].get("publishedAt", ""),
                    "channel_title": channel_title,
                })
        return videos

    def sync_youtube_feedback(
        self,
        db: Session,
        video_url: Optional[str] = None,
        channel: Optional[str] = None,
        max_comments: int = 50,
        max_videos: int = 5,
        run_nlp: bool = True,
    ) -> Dict[str, Any]:
        """High-level orchestration:
        1. Extract video or channel comments via YouTube Data API v3.
        2. Normalize through YouTubeConnector into canonical FeedbackInput.
        3. Save to database.
        4. Trigger NLP pipeline, problem clustering, trends, priority, and LLM insights.
        """
        all_raw_comments: List[Dict[str, Any]] = []
        video_meta = {}

        with httpx.Client(timeout=25.0) as client:
            if video_url:
                vid_id = self.extract_video_id(video_url)
                video_meta = self.fetch_video_details(client, vid_id)
                all_raw_comments = self.fetch_comments_for_video(client, vid_id, max_comments=max_comments)
            elif channel:
                channel_handle = self.extract_channel_handle(channel)
                videos = self.fetch_channel_videos(client, channel_handle, max_videos=max_videos)
                for v in videos:
                    comments = self.fetch_comments_for_video(client, v["video_id"], max_comments=max_comments)
                    all_raw_comments.extend(comments)
            else:
                raise ValueError("Either video_url or channel must be provided.")

        if not all_raw_comments:
            return {
                "status": "warning",
                "message": "No comments found or comments are disabled on the requested video/channel.",
                "total_comments": 0,
                "ingested": 0,
                "analyzed": 0,
            }

        # Transform raw YouTube comments into canonical FeedbackInput via connector boundary
        canonical_inputs: List[FeedbackInput] = []
        for c in all_raw_comments:
            # Parse timestamp safely
            try:
                dt = datetime.fromisoformat(c.get("created_at", "").replace("Z", "+00:00"))
            except Exception:
                dt = datetime.now(timezone.utc)

            canonical_inputs.append(
                FeedbackInput(
                    feedback_id=c["id"],
                    source="youtube",
                    source_url=c.get("source_url"),
                    text=c["text"],
                    rating=None,
                    created_at=dt,
                    metadata=c.get("metadata") or {
                        "video_id": c.get("video_id"),
                        "video_title": c.get("video_title"),
                        "channel_title": c.get("channel_title"),
                        "author": c.get("author"),
                        "like_count": c.get("like_count", 0),
                    },
                )
            )

        # Ingest into PostgreSQL database
        feedback_repo = FeedbackRepository(db)
        ingested = feedback_repo.create_batch(canonical_inputs)
        feedback_ids = [item.feedback_id for item in canonical_inputs]

        analyzed_count = 0
        problems_count = 0
        intelligence_summary = {}

        if run_nlp and feedback_ids:
            logger.info(f"Running NLP Pipeline on {len(feedback_ids)} live YouTube comments...")
            pipeline = NLPPipeline(db)
            analyses = pipeline.process_batch(feedback_ids)
            analyzed_count = len(analyses)

            # Discover problems using HDBSCAN & BERTopic
            discovered_problems = pipeline.discover_problems()
            problems_count = len(discovered_problems)

            # Re-calculate trends, priorities, recommendations, and executive LLM insights
            coordinator = IntelligenceCoordinator(db)
            intelligence_summary = coordinator.run_full_intelligence_cycle()

        return {
            "status": "success",
            "source": "youtube",
            "video_title": video_meta.get("title", channel or "YouTube Stream"),
            "channel_title": video_meta.get("channelTitle", channel or "YouTube"),
            "total_extracted": len(all_raw_comments),
            "ingested_count": len(ingested),
            "analyzed_count": analyzed_count,
            "problems_discovered": problems_count,
            "intelligence_cycle": intelligence_summary,
            "sample_comments": [
                {"id": c["id"], "author": c.get("author"), "text": c["text"][:100]}
                for c in all_raw_comments[:5]
            ],
        }
