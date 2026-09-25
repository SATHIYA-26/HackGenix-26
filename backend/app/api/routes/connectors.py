from typing import Any, Dict, List
from fastapi import APIRouter, Depends, status, Path
from sqlalchemy.orm import Session

from app.api.dependencies import get_db
from app.connectors.registry import connector_registry
from app.services.feedback_service import FeedbackService
from app.schemas.feedback import FeedbackResponse

router = APIRouter(prefix="/connectors", tags=["Source Connectors & Boundary"])


@router.get("", response_model=List[Dict[str, str]])
def list_connectors():
    """List all registered external connectors available for source ingestion."""
    return connector_registry.list_connectors()


@router.post("/{source}/ingest", response_model=FeedbackResponse, status_code=status.HTTP_201_CREATED)
def ingest_source_feedback(
    source: str = Path(..., description="Source name (e.g. youtube, google_play, app_store, zendesk, custom_api)"),
    payload: Dict[str, Any] = ...,
    db: Session = Depends(get_db),
):
    """Clean Connector Boundary: Ingest raw source-specific payload.
    
    The connector normalizes the payload into canonical FeedbackInput,
    completely decoupling the downstream NLP pipeline and intelligence engines
    from source-specific schemas.
    """
    canonical_input = connector_registry.normalize(source, payload)
    service = FeedbackService(db)
    return service.ingest_feedback(canonical_input)


@router.post("/{source}/batch", response_model=List[FeedbackResponse], status_code=status.HTTP_201_CREATED)
def ingest_source_batch(
    source: str = Path(..., description="Source name (e.g. youtube, google_play, app_store, zendesk, custom_api)"),
    payloads: List[Dict[str, Any]] = ...,
    db: Session = Depends(get_db),
):
    """Batch ingest raw source-specific payloads through the connector boundary."""
    canonical_inputs = connector_registry.normalize_batch(source, payloads)
    service = FeedbackService(db)
    return service.ingest_batch(canonical_inputs)
