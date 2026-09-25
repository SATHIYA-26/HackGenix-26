import logging
import uuid
from typing import Any, Dict, List, Optional, Set, Tuple
from sqlalchemy import select, func
from sqlalchemy.orm import Session

from backend.app.core.exceptions import EntityNotFoundError
from backend.app.integrations.youtube_api import (
    YouTubeApiClient,
    parse_comment_snippet,
    parse_comment_thread,
)
from backend.app.models.business import Business
from backend.app.models.feedback import Feedback
from backend.app.models.youtube import YouTubeChannel, YouTubeVideo
from backend.app.schemas.youtube import YouTubeSyncResponse

logger = logging.getLogger(__name__)


class YouTubeSyncService:
    """
    Service responsible for orchestrating YouTube comments synchronization,
    normalization, deduplication, and persistence into PostgreSQL.
    """

    def __init__(
        self,
        db: Session,
        api_client: Optional[YouTubeApiClient] = None,
    ):
        self.db = db
        self.api_client = api_client or YouTubeApiClient()

    def _ensure_business_exists(self, business_id: uuid.UUID) -> Business:
        """Validates that the target business exists in the database."""
        stmt = select(Business).where(Business.id == business_id)
        business = self.db.scalars(stmt).first()
        if not business:
            raise EntityNotFoundError(f"Business with ID '{business_id}' does not exist.")
        return business

    def _sync_video_metadata(self, business_id: uuid.UUID, video_id: str) -> None:
        """
        Attempts to fetch video and channel details and store/update records in
        youtube_videos and youtube_channels tables.
        """
        try:
            video_data = self.api_client.get_video_details(video_id)
            if not video_data:
                return

            snippet = video_data.get("snippet", {})
            channel_id = snippet.get("channelId")
            channel_title = snippet.get("channelTitle")
            title = snippet.get("title")
            published_at_str = snippet.get("publishedAt")

            from backend.app.integrations.youtube_api import parse_iso_datetime
            published_at = parse_iso_datetime(published_at_str) if published_at_str else None

            # Sync or create YouTubeChannel
            if channel_id:
                chan_stmt = select(YouTubeChannel).where(
                    YouTubeChannel.business_id == business_id,
                    YouTubeChannel.youtube_channel_id == channel_id,
                )
                channel_obj = self.db.scalars(chan_stmt).first()
                if not channel_obj:
                    channel_obj = YouTubeChannel(
                        business_id=business_id,
                        youtube_channel_id=channel_id,
                        channel_name=channel_title,
                        channel_url=f"https://www.youtube.com/channel/{channel_id}",
                    )
                    self.db.add(channel_obj)
                else:
                    channel_obj.channel_name = channel_title or channel_obj.channel_name

            # Sync or create YouTubeVideo
            vid_stmt = select(YouTubeVideo).where(
                YouTubeVideo.business_id == business_id,
                YouTubeVideo.youtube_video_id == video_id,
            )
            video_obj = self.db.scalars(vid_stmt).first()
            if not video_obj:
                video_obj = YouTubeVideo(
                    business_id=business_id,
                    youtube_video_id=video_id,
                    youtube_channel_id=channel_id,
                    title=title,
                    video_url=f"https://www.youtube.com/watch?v={video_id}",
                    published_at=published_at,
                )
                self.db.add(video_obj)
            else:
                video_obj.title = title or video_obj.title
                video_obj.youtube_channel_id = channel_id or video_obj.youtube_channel_id

            self.db.flush()
        except Exception as exc:
            logger.warning("Optional video metadata sync for '%s' encountered an issue: %s", video_id, str(exc))

    def fetch_all_comments_for_video(
        self,
        video_id: str,
        max_comments: Optional[int] = None,
    ) -> List[Dict[str, Any]]:
        """
        Fetches all top-level comments and replies for a video via YouTube Data API v3,
        handling pagination and reply threads.
        """
        all_comments: List[Dict[str, Any]] = []
        page_token: Optional[str] = None

        while True:
            response = self.api_client.get_comment_threads(
                video_id=video_id,
                page_token=page_token,
                max_results=100,
            )

            items = response.get("items", [])
            for item in items:
                top_comment, embedded_replies, total_reply_count = parse_comment_thread(item, video_id)
                all_comments.append(top_comment)

                # Check if we got all replies in snippet or need to fetch via comments.list
                if embedded_replies:
                    all_comments.extend(embedded_replies)

                # If total replies exceeds embedded replies (YouTube embeds up to 5 replies in commentThreads),
                # fetch the rest using comments.list
                if total_reply_count > len(embedded_replies):
                    embedded_ids: Set[str] = {r["external_id"] for r in embedded_replies}
                    reply_page_token: Optional[str] = None
                    while True:
                        reply_resp = self.api_client.get_comment_replies(
                            parent_id=top_comment["external_id"],
                            page_token=reply_page_token,
                            max_results=100,
                        )
                        for reply_item in reply_resp.get("items", []):
                            parsed_reply = parse_comment_snippet(
                                reply_item,
                                video_id=video_id,
                                parent_id=top_comment["external_id"],
                            )
                            if parsed_reply["external_id"] not in embedded_ids:
                                embedded_ids.add(parsed_reply["external_id"])
                                all_comments.append(parsed_reply)

                        reply_page_token = reply_resp.get("nextPageToken")
                        if not reply_page_token:
                            break

                if max_comments and len(all_comments) >= max_comments:
                    return all_comments[:max_comments]

            page_token = response.get("nextPageToken")
            if not page_token or (max_comments and len(all_comments) >= max_comments):
                break

        return all_comments

    def sync_video_comments(
        self,
        business_id: uuid.UUID,
        video_id: str,
        max_comments: Optional[int] = None,
    ) -> YouTubeSyncResponse:
        """
        Full synchronization routine:
        1. Validates business.
        2. Fetches comments and replies from YouTube Data API v3.
        3. Normalizes items into feedback records.
        4. Deduplicates against existing database records.
        5. Persists new records.
        """
        self._ensure_business_exists(business_id)

        # Sync video metadata (non-blocking if it fails)
        self._sync_video_metadata(business_id, video_id)

        # Fetch comments from real YouTube API
        raw_comments = self.fetch_all_comments_for_video(video_id=video_id, max_comments=max_comments)
        total_fetched = len(raw_comments)

        if total_fetched == 0:
            return YouTubeSyncResponse(
                status="success",
                video_id=video_id,
                comments_fetched=0,
                comments_inserted=0,
                duplicates=0,
            )

        # Collect external IDs to check for duplicates in the database
        all_external_ids = [c["external_id"] for c in raw_comments]
        
        # Query existing external IDs for this business and source
        stmt = select(Feedback.external_id).where(
            Feedback.business_id == business_id,
            Feedback.source == "youtube",
            Feedback.external_id.in_(all_external_ids),
        )
        existing_ids: Set[str] = set(self.db.scalars(stmt).all())

        new_feedbacks: List[Feedback] = []
        seen_in_batch: Set[str] = set()
        duplicates_count = 0

        for comment in raw_comments:
            ext_id = comment["external_id"]
            if ext_id in existing_ids or ext_id in seen_in_batch:
                duplicates_count += 1
                continue

            seen_in_batch.add(ext_id)
            feedback_obj = Feedback(
                business_id=business_id,
                source="youtube",
                source_type="comment",
                external_id=ext_id,
                parent_external_id=comment.get("parent_external_id"),
                author_name=comment.get("author_name"),
                author_url=comment.get("author_url"),
                text=comment.get("text", ""),
                rating=None,
                rating_scale=None,
                created_at=comment["created_at"],
                updated_at=comment.get("updated_at"),
                source_url=comment.get("source_url"),
                metadata_json=comment.get("metadata", {}),
            )
            new_feedbacks.append(feedback_obj)

        if new_feedbacks:
            self.db.add_all(new_feedbacks)
            self.db.commit()

        return YouTubeSyncResponse(
            status="success",
            video_id=video_id,
            comments_fetched=total_fetched,
            comments_inserted=len(new_feedbacks),
            duplicates=duplicates_count,
        )

    def get_stored_comments(
        self,
        business_id: uuid.UUID,
        page: int = 1,
        page_size: int = 50,
        parent_only: bool = False,
    ) -> Tuple[List[Feedback], int, int]:
        """
        Retrieves stored YouTube comments for a business with pagination.
        Returns (items, total_count, total_pages).
        """
        self._ensure_business_exists(business_id)

        query = select(Feedback).where(
            Feedback.business_id == business_id,
            Feedback.source == "youtube",
        )

        if parent_only:
            query = query.where(Feedback.parent_external_id.is_(None))

        # Count total
        count_stmt = select(func.count()).select_from(query.subquery())
        total_count = self.db.scalar(count_stmt) or 0

        # Pagination calculations
        page = max(page, 1)
        page_size = max(min(page_size, 100), 1)
        total_pages = (total_count + page_size - 1) // page_size if total_count > 0 else 1
        offset = (page - 1) * page_size

        # Fetch records
        items_stmt = query.order_by(Feedback.created_at.desc()).offset(offset).limit(page_size)
        items = list(self.db.scalars(items_stmt).all())

        return items, total_count, total_pages
