from typing import Any, Dict, Optional
import uuid

from app.schemas.feedback import FeedbackInput
from app.connectors.base import BaseConnector


class AppStoreConnector(BaseConnector):
    """Connector for Apple App Store Connect Customer Reviews API."""

    source_name = "app_store"

    def transform(self, raw_payload: Dict[str, Any]) -> FeedbackInput:
        review_id = (
            raw_payload.get("id")
            or raw_payload.get("review_id")
            or f"as_{uuid.uuid4().hex[:10]}"
        )

        attrs = raw_payload.get("attributes", {})
        title = attrs.get("title") or raw_payload.get("title") or ""
        body = (
            attrs.get("body")
            or attrs.get("review")
            or raw_payload.get("text")
            or raw_payload.get("review")
            or ""
        ).strip()

        combined_text = f"{title}. {body}".strip() if title and title != body else body
        if not combined_text:
            combined_text = "No review content provided."

        rating_val = attrs.get("rating") or raw_payload.get("rating") or raw_payload.get("score")
        rating: Optional[float] = None
        if rating_val is not None:
            try:
                rating = float(rating_val)
                rating = max(1.0, min(5.0, rating))
            except (ValueError, TypeError):
                rating = None

        created_date = (
            attrs.get("createdDate")
            or raw_payload.get("created_at")
            or raw_payload.get("timestamp")
        )
        created_at = self._parse_timestamp(created_date)

        app_id = raw_payload.get("app_id") or "id123456"
        source_url = raw_payload.get("source_url") or f"https://apps.apple.com/app/{app_id}?reviewId={review_id}"

        metadata = {
            "platform": "iOS",
            "reviewer_nickname": attrs.get("reviewerNickname") or raw_payload.get("author"),
            "app_version": raw_payload.get("app_version") or raw_payload.get("version"),
            "channel": "app_store",
        }
        if "metadata" in raw_payload and isinstance(raw_payload["metadata"], dict):
            metadata.update(raw_payload["metadata"])

        return FeedbackInput(
            feedback_id=str(review_id),
            source=self.source_name,
            source_url=source_url,
            text=combined_text,
            rating=rating,
            created_at=created_at,
            metadata=metadata,
        )
