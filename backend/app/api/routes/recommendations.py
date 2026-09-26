from typing import List, Optional
from fastapi import APIRouter, Depends, Query, HTTPException, status
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.db.repositories.recommendation_repository import RecommendationRepository
from app.db.repositories.insight_repository import InsightRepository
from app.schemas.recommendation import RecommendationResponse, InsightResponse

router = APIRouter(tags=["Recommendations & Insights"])


@router.get(
    "/recommendations",
    response_model=List[RecommendationResponse],
    summary="List evidence-backed product recommendations",
    description="Retrieve product recommendations with structured Observed, Inferred, and Recommended evidence.",
)
def list_recommendations(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    account_id: Optional[str] = Query(None, description="Optional account/company filter"),
    db: Session = Depends(get_db),
):
    repo = RecommendationRepository(db)
    recs, _ = repo.get_all(skip=skip, limit=limit, account_id=account_id)

    return [
        RecommendationResponse(
            id=r.id,
            problem_id=r.problem_id,
            problem_name=r.problem.name if r.problem else None,
            recommendation=r.recommendation,
            reason=r.reason,
            evidence=r.evidence or {},
            confidence=r.confidence,
            created_at=r.created_at,
        )
        for r in recs
    ]


@router.get(
    "/insights/{problem_id}",
    response_model=InsightResponse,
    summary="Get LLM executive insight for a problem",
    description="Retrieve executive synthesis, business impact, potential areas, and customer response template.",
)
def get_problem_insight(
    problem_id: int,
    db: Session = Depends(get_db),
):
    repo = InsightRepository(db)
    insight = repo.get_by_problem_id(problem_id)
    if not insight:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Insight for problem {problem_id} has not been generated yet.",
        )

    return InsightResponse(
        id=insight.id,
        problem_id=insight.problem_id,
        problem_name=insight.problem.name if insight.problem else None,
        summary=insight.summary,
        why_it_matters=insight.why_it_matters,
        evidence=insight.evidence or {},
        recommended_actions=insight.recommended_actions or [],
        suggested_response=insight.suggested_response,
        created_at=insight.created_at,
    )
