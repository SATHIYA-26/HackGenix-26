from datetime import datetime
from typing import Optional, List
from enum import Enum
from pydantic import BaseModel, Field, ConfigDict


class SentimentEnum(str, Enum):
    POSITIVE = "positive"
    NEGATIVE = "negative"
    NEUTRAL = "neutral"


class IntentEnum(str, Enum):
    PAYMENT_ISSUE = "payment_issue"
    LOGIN_ISSUE = "login_issue"
    PERFORMANCE = "performance"
    BUG = "bug"
    FEATURE_REQUEST = "feature_request"
    DELIVERY = "delivery"
    PRICING = "pricing"
    UI_UX = "ui_ux"
    ACCOUNT = "account"
    OTHER = "other"


class SentimentResult(BaseModel):
    sentiment: SentimentEnum
    confidence: float = Field(..., ge=0.0, le=1.0)


class IntentResult(BaseModel):
    intent: IntentEnum
    confidence: float = Field(..., ge=0.0, le=1.0)


class PreprocessingResult(BaseModel):
    raw_text: str
    cleaned_text: str
    language: str = "en"
    is_noise: bool = False
    is_duplicate: bool = False
    duplicate_of: Optional[str] = None


class FeedbackAnalysisFullResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    feedback_id: str
    sentiment: str
    sentiment_confidence: float
    intent: str
    intent_confidence: float
    cleaned_text: str
    language: str
    is_noise: bool
    is_duplicate: bool
    duplicate_of: Optional[str] = None
    created_at: datetime


class AnalysisRunRequest(BaseModel):
    """Trigger manual re-analysis of unprocessed or all feedback."""
    batch_size: int = Field(default=100, ge=1, le=1000)
    reprocess_all: bool = Field(default=False)
    run_clustering: bool = Field(default=True)


class AnalysisRunResponse(BaseModel):
    status: str
    processed_count: int
    clusters_discovered: int
    message: str
