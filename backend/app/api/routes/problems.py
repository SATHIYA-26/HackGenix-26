from typing import List, Optional
from fastapi import APIRouter, Depends, Query, HTTPException, status
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.db.repositories.problem_repository import ProblemRepository
from app.schemas.problem import ProblemResponse, ProblemDetailResponse, PriorityBreakdown, TraceableFeedbackItem
from app.intelligence.evidence import TraceabilityEngine

router = APIRouter(prefix="/problems", tags=["Problems & Clusters"])


@router.get(
    "",
    response_model=List[ProblemResponse],
    summary="List discovered problem clusters",
    description="Retrieve all problem clusters sorted by composite explainable priority score.",
)
def list_problems(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    sort_by_priority: bool = Query(True),
    account_id: Optional[str] = Query(None, description="Optional account/company filter"),
    db: Session = Depends(get_db),
):
    repo = ProblemRepository(db)
    problems, _ = repo.get_all(skip=skip, limit=limit, sort_by_priority=sort_by_priority, account_id=account_id)

    response_items = []
    for p in problems:
        breakdown = PriorityBreakdown(
            frequency=p.frequency_score or 0.0,
            severity=p.severity_score or 0.0,
            growth=p.growth_score or 0.0,
            user_impact=p.user_impact_score or 0.0,
            negative_sentiment=p.negative_sentiment_score or 0.0,
            priority_score=p.priority_score or 0.0,
            explanation=f"Priority {p.priority_score:.2f} based on weighted factors.",
        )
        item = ProblemResponse(
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
        response_items.append(item)

    return response_items


@router.get(
    "/{problem_id}",
    response_model=ProblemDetailResponse,
    summary="Get problem details with evidence and traceability",
    description="Retrieve full details for a problem cluster including representative customer quotes and audit lineage.",
)
def get_problem_detail(
    problem_id: int,
    db: Session = Depends(get_db),
):
    repo = ProblemRepository(db)
    problem = repo.get_by_id(problem_id)
    if not problem:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Problem {problem_id} not found.")

    traceability_engine = TraceabilityEngine(db)
    audit_trail = traceability_engine.get_problem_audit_trail(problem_id)

    breakdown = PriorityBreakdown(
        frequency=problem.frequency_score or 0.0,
        severity=problem.severity_score or 0.0,
        growth=problem.growth_score or 0.0,
        user_impact=problem.user_impact_score or 0.0,
        negative_sentiment=problem.negative_sentiment_score or 0.0,
        priority_score=problem.priority_score or 0.0,
        explanation=f"Priority {problem.priority_score:.2f} based on verified metrics.",
    )

    representative_feedback = [
        TraceableFeedbackItem(
            feedback_id=item["feedback_id"],
            source=item["source"],
            source_url=item["source_url"],
            text=item["text"],
            rating=item["rating"],
            sentiment=item["sentiment"],
            created_at=item["created_at"] or problem.created_at,
        )
        for item in audit_trail["audit_trail"]["sample_feedback_items"]
    ]

    return ProblemDetailResponse(
        id=problem.id,
        name=problem.name,
        description=problem.description,
        feedback_count=problem.feedback_count,
        average_sentiment=problem.average_sentiment,
        growth_rate=problem.growth_rate,
        severity=problem.severity,
        user_impact=problem.user_impact,
        priority_score=problem.priority_score,
        priority_breakdown=breakdown,
        product_dimension=problem.product_dimension,
        created_at=problem.created_at,
        updated_at=problem.updated_at,
        traceable_feedback_ids=[f.feedback_id for f in representative_feedback],
        representative_feedback=representative_feedback,
        evidence_summary=audit_trail["audit_trail"],
    )
