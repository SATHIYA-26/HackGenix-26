from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session

from app.db.models import ProblemCluster, Feedback, FeedbackAnalysis, Recommendation, Insight, problem_feedback
from app.db.repositories.problem_repository import ProblemRepository


class TraceabilityEngine:
    """Audit and Lineage Traceability Engine.
    
    Provides complete end-to-end evidence chains:
    Insight -> Recommendation -> Problem -> Representative Feedback -> Source -> Source URL
    """

    def __init__(self, db: Session):
        self.db = db
        self.problem_repo = ProblemRepository(db)

    def get_problem_audit_trail(self, problem_id: int) -> Dict[str, Any]:
        """Retrieve the complete evidence lineage for a problem cluster."""
        problem = self.problem_repo.get_by_id(problem_id)
        if not problem:
            raise ValueError(f"Problem {problem_id} not found.")

        # Linked feedback items
        feedback_items = self.problem_repo.get_linked_feedback(problem_id, limit=100)

        # Linked recommendation
        recommendations = problem.recommendations or []
        latest_rec = recommendations[0] if recommendations else None

        # Linked insight
        insights = problem.insights or []
        latest_insight = insights[0] if insights else None

        # Format feedback records
        traceable_feedback = []
        for f in feedback_items:
            traceable_feedback.append({
                "feedback_id": f.feedback_id,
                "source": f.source,
                "source_url": f.source_url,
                "text": f.text,
                "rating": f.rating,
                "created_at": f.created_at.isoformat() if f.created_at else None,
                "sentiment": f.analysis.sentiment if f.analysis else None,
                "intent": f.analysis.intent if f.analysis else None,
            })

        return {
            "problem": {
                "id": problem.id,
                "name": problem.name,
                "description": problem.description,
                "feedback_count": problem.feedback_count,
                "priority_score": problem.priority_score,
                "growth_rate": problem.growth_rate,
                "severity": problem.severity,
                "user_impact": problem.user_impact,
                "product_dimensions": problem.product_dimension,
            },
            "recommendation": {
                "id": latest_rec.id if latest_rec else None,
                "recommendation": latest_rec.recommendation if latest_rec else None,
                "reason": latest_rec.reason if latest_rec else None,
                "confidence": latest_rec.confidence if latest_rec else None,
            },
            "insight": {
                "id": latest_insight.id if latest_insight else None,
                "summary": latest_insight.summary if latest_insight else None,
                "why_it_matters": latest_insight.why_it_matters if latest_insight else None,
                "recommended_actions": latest_insight.recommended_actions if latest_insight else [],
                "suggested_response": latest_insight.suggested_response if latest_insight else None,
            },
            "audit_trail": {
                "total_linked_items": len(traceable_feedback),
                "sources_represented": list(set(f["source"] for f in traceable_feedback)),
                "source_urls": [f["source_url"] for f in traceable_feedback if f["source_url"]],
                "sample_feedback_items": traceable_feedback[:10],
            },
        }
