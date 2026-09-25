from typing import Any, Dict, List, Optional
from app.core.exceptions import ValidationException
from app.schemas.feedback import FeedbackInput
from app.connectors.base import BaseConnector
from app.connectors.youtube import YouTubeConnector
from app.connectors.google_play import GooglePlayConnector
from app.connectors.app_store import AppStoreConnector
from app.connectors.zendesk import ZendeskConnector
from app.connectors.custom_api import CustomAPIConnector


class ConnectorRegistry:
    """Registry maintaining active connectors to enforce clean boundary
    between external multi-channel sources and internal canonical FeedbackInput.
    """

    def __init__(self):
        self._connectors: Dict[str, BaseConnector] = {}
        self._register_defaults()

    def _register_defaults(self):
        self.register(YouTubeConnector())
        self.register(GooglePlayConnector())
        self.register(AppStoreConnector())
        self.register(ZendeskConnector())
        self.register(CustomAPIConnector())

    def register(self, connector: BaseConnector):
        """Register or override a connector implementation."""
        self._connectors[connector.source_name.lower()] = connector

    def get(self, source_name: str) -> BaseConnector:
        """Fetch connector by source name, defaulting to CustomAPIConnector if unknown."""
        key = source_name.lower().strip()
        if key in self._connectors:
            return self._connectors[key]
        # Return generic custom API connector as fallback
        return self._connectors.get("custom_api", CustomAPIConnector())

    def normalize(self, source_name: str, raw_payload: Dict[str, Any]) -> FeedbackInput:
        """Convert any source-specific raw JSON payload into canonical FeedbackInput."""
        connector = self.get(source_name)
        return connector.transform(raw_payload)

    def normalize_batch(self, source_name: str, raw_items: List[Dict[str, Any]]) -> List[FeedbackInput]:
        """Convert a batch of source-specific raw payloads into canonical FeedbackInput objects."""
        connector = self.get(source_name)
        return connector.transform_batch(raw_items)

    def list_connectors(self) -> List[Dict[str, str]]:
        return [
            {"source": name, "connector_class": conn.__class__.__name__}
            for name, conn in self._connectors.items()
        ]


connector_registry = ConnectorRegistry()
