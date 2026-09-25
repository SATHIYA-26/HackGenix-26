import uuid
from typing import List
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from backend.app.api.deps import get_db, get_youtube_sync_service
from backend.app.core.exceptions import EntityNotFoundError
from backend.app.models.business import Business
from backend.app.schemas.business import BusinessCreate, BusinessRead
from backend.app.schemas.feedback import FeedbackListResponse, FeedbackRead
from backend.app.services.youtube import YouTubeSyncService

router = APIRouter()


@router.post("", response_model=BusinessRead, status_code=status.HTTP_201_CREATED)
def create_business(
    business_in: BusinessCreate,
    db: Session = Depends(get_db),
):
    """Create a new business record."""
    business = Business(name=business_in.name)
    db.add(business)
    db.commit()
    db.refresh(business)
    return business


@router.get("", response_model=List[BusinessRead])
def list_businesses(
    db: Session = Depends(get_db),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
):
    """List all registered businesses."""
    stmt = select(Business).offset(skip).limit(limit)
    return list(db.scalars(stmt).all())


@router.get("/{business_id}", response_model=BusinessRead)
def get_business(
    business_id: uuid.UUID,
    db: Session = Depends(get_db),
):
    """Retrieve a single business by its UUID."""
    stmt = select(Business).where(Business.id == business_id)
    business = db.scalars(stmt).first()
    if not business:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Business with ID '{business_id}' not found.",
        )
    return business


@router.get("/{business_id}/youtube-comments", response_model=FeedbackListResponse)
def get_business_youtube_comments(
    business_id: uuid.UUID,
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(50, ge=1, le=100, description="Items per page"),
    parent_only: bool = Query(False, description="Filter only top-level comments (exclude replies)"),
    youtube_service: YouTubeSyncService = Depends(get_youtube_sync_service),
):
    """
    Retrieve stored YouTube comments and replies for a given business,
    with pagination support.
    """
    try:
        items, total_count, total_pages = youtube_service.get_stored_comments(
            business_id=business_id,
            page=page,
            page_size=page_size,
            parent_only=parent_only,
        )
        
        # Transform items mapping metadata_json -> metadata
        read_items = []
        for item in items:
            read_items.append(
                FeedbackRead(
                    id=item.id,
                    business_id=item.business_id,
                    source=item.source,
                    source_type=item.source_type,
                    external_id=item.external_id,
                    parent_external_id=item.parent_external_id,
                    author_name=item.author_name,
                    author_url=item.author_url,
                    text=item.text,
                    rating=item.rating,
                    rating_scale=item.rating_scale,
                    created_at=item.created_at,
                    updated_at=item.updated_at,
                    source_url=item.source_url,
                    metadata=item.metadata_json or {},
                    ingested_at=item.ingested_at,
                )
            )

        return FeedbackListResponse(
            total=total_count,
            page=page,
            page_size=page_size,
            total_pages=total_pages,
            items=read_items,
        )
    except EntityNotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=exc.message)
