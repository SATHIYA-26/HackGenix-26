from datetime import datetime
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field, ConfigDict


class PriorityBreakdown(BaseModel):
    frequency: float = Field(..., ge=0.0, le=1.0, description="Normalized volume factor")
    severity: float = Field(..., ge=0.0, le=1.0, description="Inferred issue severity score")
    growth: float = Field(..., ge=0.0, le=1.0, description="Normalized growth rate factor")
    user_impact: float = Field(..., ge=0.0, le=1.0, description="Estimated customer base impact")
    negative_sentiment: float = Field(..., ge=0.0, le=1.0, description="Negative sentiment ratio/intensity")
    priority_score: float = Field(..., ge=0.0, le=1.0, description="Final weighted composite priority score")
    explanation: str = Field(..., description="Human-readable explanation of why priority is high/medium/low")


class ProductDimension(BaseModel):
    product: Optional[str] = None
    feature: Optional[str] = None
    issue: Optional[str] = None
    platform: Optional[str] = None
    version: Optional[str] = None


class ProblemResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    description: str
    feedback_count: int
    average_sentiment: float
    growth_rate: float
    severity: float
    user_impact: float
    priority_score: float
    priority_breakdown: Optional[PriorityBreakdown] = None
    product_dimension: Optional[Dict[str, Any]] = None
    account_id: Optional[str] = None
    created_at: datetime
    updated_at: datetime


class TraceableFeedbackItem(BaseModel):
    feedback_id: str
    source: str
    source_url: Optional[str] = None
    text: str
    rating: Optional[float] = None
    sentiment: Optional[str] = None
    created_at: datetime


class ProblemDetailResponse(ProblemResponse):
    """Detailed problem cluster with evidence and traceability."""
    traceable_feedback_ids: List[str] = Field(default_factory=list)
    representative_feedback: List[TraceableFeedbackItem] = Field(default_factory=list)
    evidence_summary: Dict[str, Any] = Field(default_factory=dict)
