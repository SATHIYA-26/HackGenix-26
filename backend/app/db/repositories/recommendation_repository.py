from typing import List, Optional, Tuple, Dict, Any
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import desc

from app.db.models import Recommendation, ProblemCluster


class RecommendationRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_all(
        self,
        skip: int = 0,
        limit: int = 50,
    ) -> Tuple[List[Recommendation], int]:
        query = self.db.query(Recommendation).options(joinedload(Recommendation.problem))
        total = query.count()
        items = query.order_by(desc(Recommendation.created_at)).offset(skip).limit(limit).all()
        return items, total

    def get_by_problem_id(self, problem_id: int) -> Optional[Recommendation]:
        return (
            self.db.query(Recommendation)
            .options(joinedload(Recommendation.problem))
            .filter(Recommendation.problem_id == problem_id)
            .order_by(desc(Recommendation.created_at))
            .first()
        )

    def create(
        self,
        problem_id: int,
        recommendation: str,
        reason: str,
        evidence: Dict[str, Any],
        confidence: float = 0.85,
    ) -> Recommendation:
        existing = (
            self.db.query(Recommendation)
            .filter(Recommendation.problem_id == problem_id)
            .first()
        )
        if existing:
            existing.recommendation = recommendation
            existing.reason = reason
            existing.evidence = evidence
            existing.confidence = confidence
            self.db.commit()
            self.db.refresh(existing)
            return existing

        rec = Recommendation(
            problem_id=problem_id,
            recommendation=recommendation,
            reason=reason,
            evidence=evidence,
            confidence=confidence,
        )
        self.db.add(rec)
        self.db.commit()
        self.db.refresh(rec)
        return rec
