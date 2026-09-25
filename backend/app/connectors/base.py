from abc import ABC, abstractmethod
from typing import Any, Dict, List, Optional
import uuid
from datetime import datetime, timezone

from app.schemas.feedback import FeedbackInput


class BaseConnector(ABC):
    """Abstract Connector base class.
    
    Transforms external source-specific schemas (YouTube, Google Play, App Store,
    Zendesk, Surveys, Webhooks) into the platform's unified canonical FeedbackInput.
    The downstream NLP pipeline and backend intelligence ONLY interact with FeedbackInput.
    """

    source_name: str

    @abstractmethod
    def transform(self, raw_payload: Dict[str, Any]) -> FeedbackInput:
        """Transform a single external source item into canonical FeedbackInput."""
        pass

    def transform_batch(self, raw_payloads: List[Dict[str, Any]]) -> List[FeedbackInput]:
        """Transform a list of external source items into canonical FeedbackInput objects."""
        return [self.transform(item) for item in raw_payloads if self.validate_payload(item)]

    def validate_payload(self, raw_payload: Dict[str, Any]) -> bool:
        """Basic check that incoming raw data is a non-empty dictionary."""
        return isinstance(raw_payload, dict) and bool(raw_payload)

    def _parse_timestamp(self, ts_raw: Any) -> datetime:
        """Helper to safely parse timestamps from ISO strings, UNIX epochs, or datetime objects."""
        if not ts_raw:
            return datetime.now(timezone.utc)
        if isinstance(ts_raw, datetime):
            return ts_raw.replace(tzinfo=timezone.utc) if ts_raw.tzinfo is None else ts_raw
        if isinstance(ts_raw, (int, float)):
            try:
                return datetime.fromtimestamp(ts_raw, tz=timezone.utc)
            except Exception:
                return datetime.now(timezone.utc)
        if isinstance(ts_raw, str):
            for fmt in (
                "%Y-%m-%dT%H:%M:%SZ",
                "%Y-%m-%dT%H:%M:%S.%fZ",
                "%Y-%m-%dT%H:%M:%S%z",
                "%Y-%m-%d %H:%M:%S",
                "%Y-%m-%d",
            ):
                try:
                    dt = datetime.strptime(ts_raw, fmt)
                    return dt.replace(tzinfo=timezone.utc) if dt.tzinfo is None else dt
                except ValueError:
                    continue
        return datetime.now(timezone.utc)
