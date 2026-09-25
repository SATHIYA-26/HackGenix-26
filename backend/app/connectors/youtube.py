from typing import Any, Dict, Optional
import uuid

from app.schemas.feedback import FeedbackInput
from app.connectors.base import BaseConnector


class YouTubeConnector(BaseConnector):
    """Connector for YouTube Data API v3 Comment Threads & Video Comments."""

    source_name = "youtube"

    def transform(self, raw_payload: Dict[str, Any]) -> FeedbackInput:
        # 1. Extract Comment ID
        top_snippet = raw_payload.get("snippet", {}).get("topLevelComment", {}).get("snippet", {})
        comment_id = (
            raw_payload.get("id")
            or raw_payload.get("comment_id")
            or f"yt_{uuid.uuid4().hex[:10]}"
        )

        # 2. Extract Text
        text = (
            top_snippet.get("textDisplay")
            or top_snippet.get("textOriginal")
            or raw_payload.get("text")
            or raw_payload.get("comment")
            or raw_payload.get("body")
            or ""
        ).strip()
        if not text:
            text = "No comment text provided."

        # 3. Extract Video & Source URL
        video_id = (
            raw_payload.get("snippet", {}).get("videoId")
            or raw_payload.get("videoId")
            or raw_payload.get("video_id")
        )
        source_url = raw_payload.get("source_url")
        if not source_url and video_id:
            source_url = f"https://www.youtube.com/watch?v={video_id}&lc={comment_id}"

        # 4. Extract Timestamp
        published_at = (
            top_snippet.get("publishedAt")
            or raw_payload.get("publishedAt")
            or raw_payload.get("created_at")
            or raw_payload.get("timestamp")
        )
        created_at = self._parse_timestamp(published_at)

        # 5. Extract Metadata
        author = top_snippet.get("authorDisplayName") or raw_payload.get("author") or "YouTube User"
        like_count = top_snippet.get("likeCount") or raw_payload.get("like_count") or 0

        metadata = {
            "author": author,
            "video_id": video_id,
            "like_count": like_count,
            "platform": "youtube",
            "channel": "social_video",
        }
        # Retain any user-specified metadata
        if "metadata" in raw_payload and isinstance(raw_payload["metadata"], dict):
            metadata.update(raw_payload["metadata"])

        return FeedbackInput(
            feedback_id=str(comment_id),
            source=self.source_name,
            source_url=source_url,
            text=text,
            rating=None,  # YouTube comments have like counts rather than 1-5 star ratings
            created_at=created_at,
            metadata=metadata,
        )
