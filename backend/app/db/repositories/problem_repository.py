from typing import List, Optional, Tuple, Dict, Any
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import desc, insert, select

from app.db.models import ProblemCluster, problem_feedback, Feedback, FeedbackAnalysis


class ProblemRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_id(self, problem_id: int) -> Optional[ProblemCluster]:
        return (
            self.db.query(ProblemCluster)
            .options(
                joinedload(ProblemCluster.trends),
                joinedload(ProblemCluster.recommendations),
                joinedload(ProblemCluster.insights),
            )
            .filter(ProblemCluster.id == problem_id)
            .first()
        )

    def get_by_name(self, name: str) -> Optional[ProblemCluster]:
        return self.db.query(ProblemCluster).filter(ProblemCluster.name == name).first()

    def get_all(
        self,
        skip: int = 0,
        limit: int = 50,
        sort_by_priority: bool = True,
        account_id: Optional[str] = None,
    ) -> Tuple[List[ProblemCluster], int]:
        query = self.db.query(ProblemCluster)
        if account_id:
            query = query.filter(ProblemCluster.account_id == account_id)
        if sort_by_priority:
            query = query.order_by(desc(ProblemCluster.priority_score))
        else:
            query = query.order_by(desc(ProblemCluster.created_at))

        total = query.count()
        items = query.offset(skip).limit(limit).all()
        return items, total

    def create_or_update(
        self,
        name: str,
        description: str,
        feedback_count: int,
        average_sentiment: float,
        growth_rate: float,
        severity: float,
        user_impact: float,
        priority_score: float,
        frequency_score: float = 0.0,
        severity_score: float = 0.0,
        growth_score: float = 0.0,
        user_impact_score: float = 0.0,
        negative_sentiment_score: float = 0.0,
        product_dimension: Optional[Dict[str, Any]] = None,
        account_id: Optional[str] = "acc_manis",
    ) -> ProblemCluster:
        existing = self.get_by_name(name)
        if existing:
            existing.description = description
            existing.feedback_count = feedback_count
            existing.average_sentiment = average_sentiment
            existing.growth_rate = growth_rate
            existing.severity = severity
            existing.user_impact = user_impact
            existing.priority_score = priority_score
            existing.frequency_score = frequency_score
            existing.severity_score = severity_score
            existing.growth_score = growth_score
            existing.user_impact_score = user_impact_score
            existing.negative_sentiment_score = negative_sentiment_score
            if account_id:
                existing.account_id = account_id
            if product_dimension:
                existing.product_dimension = product_dimension
            self.db.commit()
            self.db.refresh(existing)
            return existing

        problem = ProblemCluster(
            name=name,
            description=description,
            feedback_count=feedback_count,
            average_sentiment=average_sentiment,
            growth_rate=growth_rate,
            severity=severity,
            user_impact=user_impact,
            priority_score=priority_score,
            frequency_score=frequency_score,
            severity_score=severity_score,
            growth_score=growth_score,
            user_impact_score=user_impact_score,
            negative_sentiment_score=negative_sentiment_score,
            product_dimension=product_dimension or {},
            account_id=account_id or (product_dimension.get("account_id") if product_dimension else "acc_manis"),
        )
        self.db.add(problem)
        self.db.commit()
        self.db.refresh(problem)
        return problem

    def link_feedback(self, problem_id: int, feedback_id: str, relevance_score: float = 1.0) -> None:
        # Check if link exists
        stmt = select(problem_feedback).where(
            problem_feedback.c.problem_id == problem_id,
            problem_feedback.c.feedback_id == feedback_id,
        )
        existing = self.db.execute(stmt).first()
        if not existing:
            insert_stmt = insert(problem_feedback).values(
                problem_id=problem_id,
                feedback_id=feedback_id,
                relevance_score=relevance_score,
            )
            self.db.execute(insert_stmt)
            self.db.commit()

    def get_linked_feedback(self, problem_id: int, limit: int = 50) -> List[Feedback]:
        return (
            self.db.query(Feedback)
            .join(problem_feedback, problem_feedback.c.feedback_id == Feedback.feedback_id)
            .filter(problem_feedback.c.problem_id == problem_id)
            .options(joinedload(Feedback.analysis))
            .limit(limit)
            .all()
        )

    def get_linked_feedback_ids(self, problem_id: int) -> List[str]:
        stmt = select(problem_feedback.c.feedback_id).where(
            problem_feedback.c.problem_id == problem_id
        )
        results = self.db.execute(stmt).fetchall()
        return [r[0] for r in results]

    def count(self, account_id: Optional[str] = None) -> int:
        query = self.db.query(ProblemCluster)
        if account_id:
            query = query.filter(ProblemCluster.account_id == account_id)
        return query.count()
