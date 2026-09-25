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
    canonical_inputs = connector_registry.normalize_batch(source, payloads)
    service = FeedbackService(db)
    return service.ingest_batch(canonical_inputs)


from pydantic import BaseModel, Field
from typing import Optional
from fastapi import HTTPException
from app.services.youtube_live_service import YouTubeLiveService


class YouTubeLiveSyncRequest(BaseModel):
    url: Optional[str] = Field(None, description="YouTube Video URL or ID (e.g. https://www.youtube.com/watch?v=...)")
    channel: Optional[str] = Field(None, description="YouTube Channel Handle or URL (e.g. @MrBeast)")
    max_comments: int = Field(50, ge=1, le=500, description="Max comments to fetch (1-500)")
    max_videos: int = Field(5, ge=1, le=20, description="Max videos if channel is specified")
    run_nlp: bool = Field(True, description="Automatically run NLP processing and problem discovery")
    api_key: Optional[str] = Field(None, description="Optional override for YouTube Data API v3 key")


@router.post(
    "/youtube/live-sync",
    status_code=status.HTTP_200_OK,
    summary="Live YouTube Comments & Replies Ingestion",
    description="Fetches 100% of real comments and replies from a YouTube video URL or Channel, normalizes them, and runs full NLP and Intelligence pipelines."
)
def sync_live_youtube_feedback(
    request: YouTubeLiveSyncRequest,
    db: Session = Depends(get_db),
):
    """Real-Time YouTube Extraction & Intelligence Sync."""
    if not request.url and not request.channel:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Either 'url' (video link) or 'channel' (channel handle) must be provided."
        )

    try:
        service = YouTubeLiveService(api_key=request.api_key)
        result = service.sync_youtube_feedback(
            db=db,
            video_url=request.url,
            channel=request.channel,
            max_comments=request.max_comments,
            max_videos=request.max_videos,
            run_nlp=request.run_nlp,
        )
        return result
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"YouTube extraction failed: {str(exc)}"
        )

