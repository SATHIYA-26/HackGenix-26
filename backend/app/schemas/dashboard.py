from datetime import datetime
from typing import Any, Dict, List
from pydantic import BaseModel
from app.schemas.problem import ProblemResponse
from app.schemas.trend import TrendResponse


class DashboardSummary(BaseModel):
    total_feedback: int
    analyzed_feedback: int
    total_problems: int
    emerging_problems_count: int
    average_sentiment_score: float
    sentiment_distribution: Dict[str, int]
    intent_distribution: Dict[str, int]
    source_distribution: Dict[str, int]
    top_priority_problems: List[ProblemResponse]
    emerging_trends: List[TrendResponse]
