from datetime import datetime
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field, field_validator, ConfigDict


class FeedbackMetadata(BaseModel):
    model_config = ConfigDict(extra="allow")

    product: Optional[str] = None
    feature: Optional[str] = None
    platform: Optional[str] = None
    version: Optional[str] = None
    channel: Optional[str] = None


class CanonicalFeedbackInput(BaseModel):
    """Canonical feedback payload schema that all input sources must normalize to."""
    model_config = ConfigDict(from_attributes=True)

    feedback_id: str = Field(..., description="Unique identifier across sources, e.g. yt_123 or gp_456")
    source: str = Field(..., description="Source system name, e.g. youtube, google_play, support_ticket")
    source_url: Optional[str] = Field(None, description="Direct URL to original source item")
    text: str = Field(..., min_length=1, max_length=10000, description="Raw customer feedback text")
    rating: Optional[float] = Field(None, ge=1.0, le=5.0, description="Optional numerical rating (1-5)")
    created_at: datetime = Field(..., description="Timestamp when feedback was originally created at source")
    metadata: Optional[Dict[str, Any]] = Field(default_factory=dict, description="Arbitrary source metadata")

    @field_validator("feedback_id", "source")
    @classmethod
    def validate_non_empty_string(cls, v: str, info) -> str:
        if not v or not v.strip():
            raise ValueError(f"{info.field_name} must not be empty or whitespace only")
        return v.strip()

    @field_validator("text")
    @classmethod
    def validate_text(cls, v: str) -> str:
        cleaned = v.strip()
        if not cleaned:
            raise ValueError("Feedback text must not be empty or whitespace only")
        return cleaned


# Canonical alias as specified in system architecture
FeedbackInput = CanonicalFeedbackInput



class FeedbackBatchInput(BaseModel):
    """Batch feedback submission schema."""
    items: List[CanonicalFeedbackInput] = Field(..., min_length=1, max_length=2000)


class FeedbackAnalysisBrief(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    sentiment: str
    sentiment_confidence: float
    intent: str
    intent_confidence: float
    cleaned_text: str
    language: str
    is_noise: bool
    is_duplicate: bool


class FeedbackResponse(BaseModel):
    """Full feedback response schema."""
    model_config = ConfigDict(from_attributes=True, populate_by_name=True)

    id: int
    feedback_id: str
    source: str
    source_url: Optional[str] = None
    text: str
    rating: Optional[float] = None
    created_at: datetime
    metadata: Optional[Dict[str, Any]] = Field(
        default_factory=dict,
        validation_alias="extra_metadata",
        serialization_alias="metadata",
    )
    created_at_db: datetime
    analysis: Optional[FeedbackAnalysisBrief] = None


class FeedbackListResponse(BaseModel):
    """Paginated feedback response."""
    items: List[FeedbackResponse]
    total: int
    page: int
    limit: int
