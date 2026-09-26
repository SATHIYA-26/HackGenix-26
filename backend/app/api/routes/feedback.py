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
    account_id: Optional[str] = Query(None, description="Filter by account/company ID"),
    service: FeedbackService = Depends(get_feedback_service),
):
    items, total = service.list_feedback(
        page=page,
        limit=limit,
        source=source,
        sentiment=sentiment,
        intent=intent,
        account_id=account_id,
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


from sqlalchemy.orm import Session
from sqlalchemy import delete
from app.db.database import get_db
from app.db.models import (
    Action,
    Insight,
    Recommendation,
    Trend,
    problem_feedback,
    ProblemCluster,
    FeedbackEmbedding,
    FeedbackAnalysis,
    Feedback,
)


@router.post(
    "/reset",
    status_code=status.HTTP_200_OK,
    summary="Purge All Feedback & Mock Data",
    description="Wipes all feedback, problem clusters, trends, recommendations, and actions. Requires ?confirm=true.",
)
def reset_database(
    confirm: bool = Query(False, description="Must be true to confirm database purge"),
    db: Session = Depends(get_db),
):
    if not confirm:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Confirmation required. Pass ?confirm=true to purge all mock/testing data."
        )

    # Delete child records in topological order
    db.query(Action).delete(synchronize_session=False)
    db.query(Insight).delete(synchronize_session=False)
    db.query(Recommendation).delete(synchronize_session=False)
    db.query(Trend).delete(synchronize_session=False)
    db.execute(delete(problem_feedback))
    db.query(ProblemCluster).delete(synchronize_session=False)
    db.query(FeedbackEmbedding).delete(synchronize_session=False)
    db.query(FeedbackAnalysis).delete(synchronize_session=False)
    deleted_count = db.query(Feedback).delete(synchronize_session=False)
    db.commit()

    return {
        "status": "success",
        "message": "All mock and testing feedback data has been purged. Database is 100% clean.",
        "records_purged": deleted_count,
    }

