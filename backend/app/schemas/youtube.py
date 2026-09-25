import uuid
from typing import Optional
from pydantic import BaseModel, Field


class YouTubeSyncRequest(BaseModel):
    business_id: uuid.UUID = Field(..., description="Target business UUID to link comments to")
    max_comments: Optional[int] = Field(
        default=None,
        ge=1,
        description="Optional upper bound on total comments to fetch. If omitted, all available comments are synced."
    )


class YouTubeSyncResponse(BaseModel):
    status: str = Field(default="success", description="Status of sync execution")
    video_id: str = Field(..., description="YouTube Video ID processed")
    comments_fetched: int = Field(..., description="Total comments and replies fetched from YouTube API")
    comments_inserted: int = Field(..., description="New comments saved to database")
    duplicates: int = Field(..., description="Duplicate comments skipped")
