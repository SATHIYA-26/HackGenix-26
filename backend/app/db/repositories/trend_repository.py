from typing import List, Optional, Tuple
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import desc

from app.db.models import Trend, ProblemCluster


class TrendRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_all(
        self,
        only_emerging: bool = False,
        skip: int = 0,
        limit: int = 50,
        account_id: Optional[str] = None,
    ) -> Tuple[List[Trend], int]:
        query = self.db.query(Trend).options(joinedload(Trend.problem))
        if account_id:
            query = query.join(Trend.problem).filter(ProblemCluster.account_id == account_id)
        if only_emerging:
            query = query.filter(Trend.is_emerging.is_(True))

        total = query.count()
        items = query.order_by(desc(Trend.growth_rate)).offset(skip).limit(limit).all()
        return items, total

    def get_by_problem_id(self, problem_id: int) -> Optional[Trend]:
        return (
            self.db.query(Trend)
            .options(joinedload(Trend.problem))
            .filter(Trend.problem_id == problem_id)
            .first()
        )

    def create_or_update(
        self,
        problem_id: int,
        time_window: str,
        current_count: int,
        previous_count: int,
        growth_rate: float,
        is_emerging: bool,
    ) -> Trend:
        existing = (
            self.db.query(Trend)
            .filter(Trend.problem_id == problem_id, Trend.time_window == time_window)
            .first()
        )
        if existing:
            existing.current_count = current_count
            existing.previous_count = previous_count
            existing.growth_rate = growth_rate
            existing.is_emerging = is_emerging
            self.db.commit()
            self.db.refresh(existing)
            return existing

        trend = Trend(
            problem_id=problem_id,
            time_window=time_window,
            current_count=current_count,
            previous_count=previous_count,
            growth_rate=growth_rate,
            is_emerging=is_emerging,
        )
        self.db.add(trend)
        self.db.commit()
        self.db.refresh(trend)
        return trend

    def count_emerging(self, account_id: Optional[str] = None) -> int:
        q = self.db.query(Trend).filter(Trend.is_emerging.is_(True))
        if account_id:
            q = q.join(Trend.problem).filter(ProblemCluster.account_id == account_id)
        return q.count()
