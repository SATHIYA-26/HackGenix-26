from typing import List, Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.db.repositories.trend_repository import TrendRepository
from app.schemas.trend import TrendResponse

router = APIRouter(prefix="/trends", tags=["Trend Analysis"])


@router.get(
    "",
    response_model=List[TrendResponse],
    summary="List trend velocity across problems",
    description="Retrieve time-window trend metrics and filter for emerging issues.",
)
def list_trends(
    only_emerging: bool = Query(False, description="Filter only to emerging problem spikes"),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db),
):
    repo = TrendRepository(db)
    trends, _ = repo.get_all(only_emerging=only_emerging, skip=skip, limit=limit)

    return [
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
        for t in trends
    ]
