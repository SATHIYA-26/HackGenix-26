from datetime import datetime
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, ConfigDict


class RecommendationEvidence(BaseModel):
    observed: str
    inferred: str
    feedback_count: int
    negative_sentiment_pct: float
    growth_pct: float
    affected_components: Dict[str, Any]
    traceable_feedback_ids: List[str]


class RecommendationResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    problem_id: int
    problem_name: Optional[str] = None
    recommendation: str
    reason: str
    evidence: Dict[str, Any]
    confidence: float
    created_at: datetime


class InsightResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    problem_id: int
    problem_name: Optional[str] = None
    summary: str
    why_it_matters: str
    evidence: Dict[str, Any]
    recommended_actions: List[str]
    suggested_response: Optional[str] = None
    created_at: datetime
