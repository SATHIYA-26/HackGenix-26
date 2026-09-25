from typing import Any, Dict, Optional
import uuid

from app.schemas.feedback import FeedbackInput
from app.connectors.base import BaseConnector


class CustomAPIConnector(BaseConnector):
    """Generic Connector for in-house webhooks, NPS surveys, and REST APIs."""

    source_name = "custom_api"

    def transform(self, raw_payload: Dict[str, Any]) -> FeedbackInput:
        feedback_id = (
            raw_payload.get("feedback_id")
            or raw_payload.get("id")
            or raw_payload.get("uuid")
            or f"api_{uuid.uuid4().hex[:10]}"
        )

        source = (
            raw_payload.get("source")
            or self.source_name
        )

        text = (
            raw_payload.get("text")
            or raw_payload.get("message")
            or raw_payload.get("comment")
            or raw_payload.get("content")
            or raw_payload.get("feedback")
            or ""
        ).strip()
        if not text:
            text = "Customer feedback without text."

        rating_val = raw_payload.get("rating") or raw_payload.get("score") or raw_payload.get("nps")
        rating: Optional[float] = None
        if rating_val is not None:
            try:
                r = float(rating_val)
                # If NPS 0-10, scale to 1-5 or clamp
                if r > 5.0 and r <= 10.0:
                    r = (r / 2.0)
                rating = max(1.0, min(5.0, round(r, 1)))
            except (ValueError, TypeError):
                rating = None

        created_at_raw = (
            raw_payload.get("created_at")
            or raw_payload.get("timestamp")
            or raw_payload.get("date")
        )
        created_at = self._parse_timestamp(created_at_raw)
        source_url = raw_payload.get("source_url")

        metadata = raw_payload.get("metadata", {})
        if not isinstance(metadata, dict):
            metadata = {}

        for extra_key in ("platform", "version", "product", "feature", "component", "device", "user_id"):
            if extra_key in raw_payload and extra_key not in metadata:
                metadata[extra_key] = raw_payload[extra_key]

        return FeedbackInput(
            feedback_id=str(feedback_id),
            source=source,
            source_url=source_url,
            text=text,
            rating=rating,
            created_at=created_at,
            metadata=metadata,
        )
