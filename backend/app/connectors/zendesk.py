from typing import Any, Dict, Optional
import uuid

from app.schemas.feedback import FeedbackInput
from app.connectors.base import BaseConnector


class ZendeskConnector(BaseConnector):
    """Connector for Zendesk Support Tickets API."""

    source_name = "zendesk"

    def transform(self, raw_payload: Dict[str, Any]) -> FeedbackInput:
        ticket = raw_payload.get("ticket") if "ticket" in raw_payload else raw_payload

        ticket_id = (
            ticket.get("id")
            or raw_payload.get("ticket_id")
            or f"zd_{uuid.uuid4().hex[:10]}"
        )

        subject = ticket.get("subject", "").strip()
        description = (
            ticket.get("description")
            or ticket.get("body")
            or raw_payload.get("text")
            or ""
        ).strip()

        if subject and description and subject.lower() not in description.lower():
            full_text = f"{subject}: {description}"
        else:
            full_text = description or subject or "Support ticket without text."

        # Satisfaction rating from Zendesk (e.g. "good" -> 5.0, "bad" -> 1.0)
        rating: Optional[float] = None
        sat = ticket.get("satisfaction_rating", {})
        if isinstance(sat, dict):
            score = sat.get("score")
            if score == "good":
                rating = 5.0
            elif score == "bad":
                rating = 1.0
        elif ticket.get("rating"):
            try:
                rating = float(ticket["rating"])
            except (ValueError, TypeError):
                pass

        created_at_raw = ticket.get("created_at") or raw_payload.get("timestamp")
        created_at = self._parse_timestamp(created_at_raw)

        subdomain = raw_payload.get("subdomain") or "support"
        source_url = raw_payload.get("source_url") or f"https://{subdomain}.zendesk.com/agent/tickets/{ticket_id}"

        metadata = {
            "channel": "support_ticket",
            "priority": ticket.get("priority", "normal"),
            "status": ticket.get("status", "closed"),
            "type": ticket.get("type", "incident"),
            "tags": ticket.get("tags", []),
            "requester_id": ticket.get("requester_id"),
        }
        if "metadata" in raw_payload and isinstance(raw_payload["metadata"], dict):
            metadata.update(raw_payload["metadata"])

        return FeedbackInput(
            feedback_id=str(ticket_id),
            source="support_ticket",
            source_url=source_url,
            text=full_text,
            rating=rating,
            created_at=created_at,
            metadata=metadata,
        )
