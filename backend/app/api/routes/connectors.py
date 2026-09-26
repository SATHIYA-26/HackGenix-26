from typing import Any, Dict, List, Optional
from fastapi import APIRouter, Depends, status, Path, Query
from sqlalchemy.orm import Session

from app.api.dependencies import get_db
from app.connectors.registry import connector_registry
from app.services.feedback_service import FeedbackService
from app.schemas.feedback import FeedbackResponse
from app.db.repositories.feedback_repository import FeedbackRepository

router = APIRouter(prefix="/connectors", tags=["Source Connectors & Boundary"])


@router.get("", response_model=List[Dict[str, Any]])
def list_connectors(
    account_id: Optional[str] = Query(None, description="Optional account/company ID to filter live volume counts"),
    db: Session = Depends(get_db),
):
    """List all registered external connectors available for source ingestion with live feedback counts."""
    connectors = connector_registry.list_connectors()
    feedback_repo = FeedbackRepository(db)
    counts = feedback_repo.get_source_distribution(account_id=account_id)

    meta_map = {
        "youtube": {
            "name": "YouTube",
            "description": "Video comments, replies & live stream feedback",
            "accent": "#EF4444",
            "bgAccent": "#FEF2F2",
            "borderAccent": "#FECACA",
            "latency": "Real-time",
            "icon": "youtube",
        },
        "google_play": {
            "name": "Google Play",
            "description": "Android app reviews, ratings & version telemetry",
            "accent": "#0086F8",
            "bgAccent": "#EFF6FF",
            "borderAccent": "#BFDBFE",
            "latency": "15ms",
            "icon": "google_play",
        },
        "app_store": {
            "name": "App Store",
            "description": "iOS app store customer reviews & ratings",
            "accent": "#0284C7",
            "bgAccent": "#F0F9FF",
            "borderAccent": "#BAE6FD",
            "latency": "20ms",
            "icon": "app_store",
        },
        "zendesk": {
            "name": "Zendesk",
            "description": "Customer support tickets, CSAT & escalation logs",
            "accent": "#059669",
            "bgAccent": "#ECFDF5",
            "borderAccent": "#A7F3D0",
            "latency": "18ms",
            "icon": "zendesk",
        },
        "custom_api": {
            "name": "Custom API",
            "description": "Transactional feedback & in-app survey webhooks",
            "accent": "#8B5CF6",
            "bgAccent": "#F5F3FF",
            "borderAccent": "#DDD6FE",
            "latency": "8ms",
            "icon": "custom_api",
        },
        "google_maps": {
            "name": "Google Maps",
            "description": "Branch reviews, local guides & location ratings",
            "accent": "#EA4335",
            "bgAccent": "#FEF2F2",
            "borderAccent": "#FECACA",
            "latency": "Real-time",
            "icon": "google_maps",
        },
        "swiggy": {
            "name": "Swiggy",
            "description": "Food order reviews, ratings & delivery feedback",
            "accent": "#FC8019",
            "bgAccent": "#FFF7ED",
            "borderAccent": "#FFEDD5",
            "latency": "Real-time",
            "icon": "swiggy",
        },
        "zomato": {
            "name": "Zomato",
            "description": "Dining & takeaway delivery customer feedback streams",
            "accent": "#E23744",
            "bgAccent": "#FFF1F2",
            "borderAccent": "#FFE4E6",
            "latency": "Real-time",
            "icon": "zomato",
        },
        "in_store_pos": {
            "name": "In-Store POS / Tablet",
            "description": "Physical restaurant tablet & point-of-sale feedback",
            "accent": "#0D9488",
            "bgAccent": "#F0FDFA",
            "borderAccent": "#CCFBF1",
            "latency": "Instant",
            "icon": "in_store_pos",
        },
        "reddit": {
            "name": "Reddit",
            "description": "Community threads, discussion boards & feedback posts",
            "accent": "#FF4500",
            "bgAccent": "#FFF7ED",
            "borderAccent": "#FFEDD5",
            "latency": "22ms",
            "icon": "reddit",
        },
    }

    results = []
    seen = set()

    # 1. First add all sources that actually have ingested feedback for this account!
    for src, cnt in counts.items():
        seen.add(src)
        info = meta_map.get(src, {
            "name": src.replace("_", " ").title(),
            "description": f"Streaming ingestion pipeline for {src.replace('_', ' ').title()}",
            "accent": "#71717A",
            "bgAccent": "#F4F4F5",
            "borderAccent": "#E4E4E7",
            "latency": "Real-time",
            "icon": src,
        })
        results.append({
            "source": src,
            "connector_class": "ActiveSourceConnector",
            "name": info["name"],
            "description": info["description"],
            "total_feedback": cnt,
            "itemsCount": cnt,
            "status": "connected",
            "lastSync": "Live",
            "latency": info["latency"],
            "accent": info["accent"],
            "bgAccent": info["bgAccent"],
            "borderAccent": info["borderAccent"],
            "icon": info["icon"],
        })

    # 2. Then add registered connectors if not already added
    for c in connectors:
        src = c["source"]
        if src in seen:
            continue
        seen.add(src)
        cnt = counts.get(src, 0)
        if cnt == 0 and src == "youtube":
            cnt = counts.get("youtube_comments", counts.get("youtube_live", 0))
        elif cnt == 0 and src == "google_play":
            cnt = counts.get("play_store", counts.get("playstore", 0))

        info = meta_map.get(src, {
            "name": src.replace("_", " ").title(),
            "description": f"Real-time pipeline for {src}",
            "accent": "#71717A",
            "bgAccent": "#F4F4F5",
            "borderAccent": "#E4E4E7",
            "latency": "Live",
            "icon": src,
        })

        results.append({
            "source": src,
            "connector_class": c["connector_class"],
            "name": info["name"],
            "description": info["description"],
            "total_feedback": cnt,
            "itemsCount": cnt,
            "status": "connected",
            "lastSync": "Live" if cnt > 0 else "Ready",
            "latency": info["latency"] if cnt > 0 else "Live",
            "accent": info["accent"],
            "bgAccent": info["bgAccent"],
            "borderAccent": info["borderAccent"],
            "icon": info["icon"],
        })

    return results


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
    account_id: Optional[str] = Field("acc_vj_sidhu", description="Target account ID to tag feedback with")


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
            account_id=request.account_id or "acc_mrwhosetheboss",
        )
        return result
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"YouTube extraction failed: {str(exc)}"
        )

