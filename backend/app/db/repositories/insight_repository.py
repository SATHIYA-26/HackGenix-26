from typing import List, Optional, Tuple, Dict, Any
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import desc

from app.db.models import Insight, ProblemCluster


class InsightRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_problem_id(self, problem_id: int) -> Optional[Insight]:
        return (
            self.db.query(Insight)
            .options(joinedload(Insight.problem))
            .filter(Insight.problem_id == problem_id)
            .order_by(desc(Insight.created_at))
            .first()
        )

    def create_or_update(
        self,
        problem_id: int,
        summary: str,
        why_it_matters: str,
        evidence: Dict[str, Any],
        recommended_actions: List[str],
        suggested_response: Optional[str] = None,
    ) -> Insight:
        existing = (
            self.db.query(Insight)
            .filter(Insight.problem_id == problem_id)
            .first()
        )
        if existing:
            existing.summary = summary
            existing.why_it_matters = why_it_matters
            existing.evidence = evidence
            existing.recommended_actions = recommended_actions
            existing.suggested_response = suggested_response
            self.db.commit()
            self.db.refresh(existing)
            return existing

        insight = Insight(
            problem_id=problem_id,
            summary=summary,
            why_it_matters=why_it_matters,
            evidence=evidence,
            recommended_actions=recommended_actions,
            suggested_response=suggested_response,
        )
        self.db.add(insight)
        self.db.commit()
        self.db.refresh(insight)
        return insight
