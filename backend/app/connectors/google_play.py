from typing import Any, Dict, Optional
import uuid

from app.schemas.feedback import FeedbackInput
from app.connectors.base import BaseConnector


class GooglePlayConnector(BaseConnector):
    """Connector for Google Play Developer API Review responses."""

    source_name = "google_play"

    def transform(self, raw_payload: Dict[str, Any]) -> FeedbackInput:
        # 1. Extract Review ID
        review_id = (
            raw_payload.get("reviewId")
            or raw_payload.get("id")
            or f"gp_{uuid.uuid4().hex[:10]}"
        )

        # 2. Extract Comment Text & Rating from Google Play structure
        user_comment = {}
        comments = raw_payload.get("comments", [])
        if comments and isinstance(comments, list) and len(comments) > 0:
            user_comment = comments[0].get("userComment", {})

        text = (
            user_comment.get("text")
            or raw_payload.get("text")
            or raw_payload.get("review")
            or ""
        ).strip()
        if not text:
            text = "No review content provided."

        rating_val = (
            user_comment.get("starRating")
            or raw_payload.get("rating")
            or raw_payload.get("score")
            or raw_payload.get("stars")
        )
        rating: Optional[float] = None
        if rating_val is not None:
            try:
                rating = float(rating_val)
                rating = max(1.0, min(5.0, rating))
            except (ValueError, TypeError):
                rating = None

        # 3. Extract Timestamp
        last_modified = (
            user_comment.get("lastModified", {}).get("seconds")
            or raw_payload.get("lastModified")
            or raw_payload.get("created_at")
            or raw_payload.get("timestamp")
        )
        created_at = self._parse_timestamp(last_modified)

        # 4. Extract App details & Device metadata
        package_name = raw_payload.get("package_name") or "com.app.shop"
        source_url = raw_payload.get("source_url") or f"https://play.google.com/store/apps/details?id={package_name}&reviewId={review_id}"

        app_version = (
            user_comment.get("appVersionName")
            or raw_payload.get("app_version")
            or raw_payload.get("version")
        )
        device = (
            user_comment.get("deviceMetadata", {}).get("productName")
            or raw_payload.get("device")
        )

        metadata = {
            "platform": "Android",
            "app_version": app_version,
            "device": device,
            "thumbs_up_count": user_comment.get("thumbsUpCount", 0),
            "reviewer_language": user_comment.get("reviewerLanguage", "en"),
            "channel": "google_play",
        }
        if "metadata" in raw_payload and isinstance(raw_payload["metadata"], dict):
            metadata.update(raw_payload["metadata"])

        return FeedbackInput(
            feedback_id=str(review_id),
            source=self.source_name,
            source_url=source_url,
            text=text,
            rating=rating,
            created_at=created_at,
            metadata=metadata,
        )
