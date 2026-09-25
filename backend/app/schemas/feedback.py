import uuid
from datetime import datetime
from typing import Optional, Dict, Any, List
from pydantic import BaseModel, ConfigDict, Field


class FeedbackBase(BaseModel):
    source: str = Field(..., description="Platform identifier, e.g. 'youtube', 'google_maps'")
    source_type: str = Field(default="comment", description="Feedback format, e.g. 'comment', 'review'")
    external_id: str = Field(..., description="Unique platform ID for the feedback item")
    parent_external_id: Optional[str] = Field(default=None, description="Parent ID if this is a reply")
    author_name: Optional[str] = Field(default=None, description="Author display name")
    author_url: Optional[str] = Field(default=None, description="Author profile / channel URL")
    text: str = Field(..., description="Cleaned feedback text content")
    rating: Optional[float] = Field(default=None, description="Numerical rating if available")
    rating_scale: Optional[float] = Field(default=None, description="Maximum scale for rating, e.g. 5.0")
    created_at: datetime = Field(..., description="Platform publication timestamp")
    updated_at: Optional[datetime] = Field(default=None, description="Platform update timestamp")
    source_url: Optional[str] = Field(default=None, description="Direct URL to feedback or video")
    metadata: Optional[Dict[str, Any]] = Field(default_factory=dict, description="Platform-specific metadata")


class FeedbackCreate(FeedbackBase):
    business_id: uuid.UUID


class FeedbackRead(FeedbackBase):
    id: uuid.UUID
    business_id: uuid.UUID
    ingested_at: datetime

    model_config = ConfigDict(
        from_attributes=True,
        populate_by_name=True,
    )

    @classmethod
    def model_validate(cls, obj: Any, *args, **kwargs):
        # Handle metadata_json mapping from SQLAlchemy model to 'metadata' schema field
        if hasattr(obj, "metadata_json") and not hasattr(obj, "metadata"):
            # If object is an ORM model
            pass
        return super().model_validate(obj, *args, **kwargs)


class FeedbackListResponse(BaseModel):
    total: int = Field(..., description="Total feedback records matching criteria")
    page: int = Field(default=1, description="Current page number")
    page_size: int = Field(default=50, description="Items per page")
    total_pages: int = Field(..., description="Total pages available")
    items: List[FeedbackRead] = Field(default_factory=list, description="List of feedback items")
