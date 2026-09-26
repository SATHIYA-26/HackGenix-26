from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.db.repositories.feedback_repository import FeedbackRepository
from app.db.repositories.problem_repository import ProblemRepository
from app.db.repositories.trend_repository import TrendRepository
from app.schemas.dashboard import DashboardSummary
from app.schemas.problem import ProblemResponse, PriorityBreakdown
from app.schemas.trend import TrendResponse

router = APIRouter(prefix="/dashboard", tags=["Dashboard Summary"])


@router.get(
    "/summary",
    response_model=DashboardSummary,
    summary="Executive Dashboard Summary",
    description="Holistic high-level overview of feedback volume, emerging trends, priority problems, and sentiment.",
)
def get_dashboard_summary(
    account_id: Optional[str] = Query(None, description="Optional account/company filter"),
    db: Session = Depends(get_db),
):
    feedback_repo = FeedbackRepository(db)
    problem_repo = ProblemRepository(db)
    trend_repo = TrendRepository(db)

    total_feedback = feedback_repo.count(account_id=account_id)
    analyzed_feedback = feedback_repo.count_analyzed(account_id=account_id)
    total_problems = problem_repo.count(account_id=account_id)
    emerging_count = trend_repo.count_emerging(account_id=account_id)

    sentiment_dist = feedback_repo.get_sentiment_distribution(account_id=account_id)
    intent_dist = feedback_repo.get_intent_distribution(account_id=account_id)
    source_dist = feedback_repo.get_source_distribution(account_id=account_id)

    # Calculate average sentiment score (-1.0 to 1.0)
    pos_count = sentiment_dist.get("positive", 0)
    neg_count = sentiment_dist.get("negative", 0)
    total_sentiment_items = pos_count + neg_count + sentiment_dist.get("neutral", 0)
    if total_sentiment_items > 0:
        avg_sentiment = (pos_count - neg_count) / float(total_sentiment_items)
    else:
        avg_sentiment = 0.0

    # Top priority problems
    top_problems, _ = problem_repo.get_all(skip=0, limit=5, sort_by_priority=True, account_id=account_id)
    top_problem_responses = []
    for p in top_problems:
        breakdown = PriorityBreakdown(
            frequency=p.frequency_score or 0.0,
            severity=p.severity_score or 0.0,
            growth=p.growth_score or 0.0,
            user_impact=p.user_impact_score or 0.0,
            negative_sentiment=p.negative_sentiment_score or 0.0,
            priority_score=p.priority_score or 0.0,
            explanation=f"Priority {p.priority_score:.2f}",
        )
        top_problem_responses.append(
            ProblemResponse(
                id=p.id,
                name=p.name,
                description=p.description,
                feedback_count=p.feedback_count,
                average_sentiment=p.average_sentiment,
                growth_rate=p.growth_rate,
                severity=p.severity,
                user_impact=p.user_impact,
                priority_score=p.priority_score,
                priority_breakdown=breakdown,
                product_dimension=p.product_dimension,
                account_id=p.account_id,
                created_at=p.created_at,
                updated_at=p.updated_at,
            )
        )

    # Emerging trends
    emerging_trends, _ = trend_repo.get_all(only_emerging=True, limit=5, account_id=account_id)
    trend_responses = [
        TrendResponse(
            id=t.id,
            problem_id=t.problem_id,
            problem_name=t.problem.name if t.problem else None,
            time_window=t.time_window,
            current_count=t.current_count,
            previous_count=t.previous_count,
            growth_rate=t.growth_rate,
            is_emerging=t.is_emerging,
            calculated_at=t.calculated_at,
        )
        for t in emerging_trends
    ]

    return DashboardSummary(
        total_feedback=total_feedback,
        analyzed_feedback=analyzed_feedback,
        total_problems=total_problems,
        emerging_problems_count=emerging_count,
        average_sentiment_score=round(avg_sentiment, 2),
        sentiment_distribution=sentiment_dist,
        intent_distribution=intent_dist,
        source_distribution=source_dist,
        top_priority_problems=top_problem_responses,
        emerging_trends=trend_responses,
    )
