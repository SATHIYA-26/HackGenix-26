from typing import Optional, List
from fastapi import APIRouter, Depends, status, Query, HTTPException

from app.schemas.feedback import (
    CanonicalFeedbackInput,
    FeedbackBatchInput,
    FeedbackResponse,
    FeedbackListResponse,
)
from app.services.feedback_service import FeedbackService
from app.api.dependencies import get_feedback_service
from app.core.exceptions import ResourceNotFoundException

router = APIRouter(prefix="/feedback", tags=["Feedback Ingestion"])


@router.post(
    "",
    response_model=FeedbackResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Ingest a canonical feedback item",
    description="Receive source-agnostic customer feedback from any channel (YouTube, Play Store, Tickets, etc.).",
)
def ingest_feedback(
    payload: CanonicalFeedbackInput,
    service: FeedbackService = Depends(get_feedback_service),
):
    feedback = service.ingest_feedback(payload)
    return feedback


@router.post(
    "/batch",
    response_model=List[FeedbackResponse],
    status_code=status.HTTP_201_CREATED,
    summary="Batch ingest canonical feedback items",
    description="Bulk ingest multiple normalized feedback records efficiently in one request.",
)
def ingest_feedback_batch(
    payload: FeedbackBatchInput,
    service: FeedbackService = Depends(get_feedback_service),
):
    created_items = service.ingest_batch(payload.items)
    return created_items


@router.get(
    "",
    response_model=FeedbackListResponse,
    summary="List feedback items",
    description="Retrieve paginated feedback with optional filtering by source, sentiment, and intent.",
)
def list_feedback(
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(50, ge=1, le=500, description="Items per page"),
    source: Optional[str] = Query(None, description="Filter by feedback source"),
    sentiment: Optional[str] = Query(None, description="Filter by sentiment (positive, negative, neutral)"),
    intent: Optional[str] = Query(None, description="Filter by intent category"),
    service: FeedbackService = Depends(get_feedback_service),
):
    items, total = service.list_feedback(
        page=page,
        limit=limit,
        source=source,
        sentiment=sentiment,
        intent=intent,
    )
    return FeedbackListResponse(
        items=items,
        total=total,
        page=page,
        limit=limit,
    )


@router.get(
    "/{feedback_id}",
    response_model=FeedbackResponse,
    summary="Get feedback by ID",
    description="Retrieve a single feedback item and its NLP analysis by feedback_id.",
)
def get_feedback(
    feedback_id: str,
    service: FeedbackService = Depends(get_feedback_service),
):
    try:
        return service.get_by_id(feedback_id)
    except ResourceNotFoundException as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc))
