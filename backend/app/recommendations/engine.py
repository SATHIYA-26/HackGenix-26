from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session

from app.core.logging import logger
from app.db.models import ProblemCluster, Recommendation, Feedback, FeedbackAnalysis, problem_feedback
from app.db.repositories.problem_repository import ProblemRepository
from app.db.repositories.recommendation_repository import RecommendationRepository
from app.intelligence.feature_extraction import dimension_extractor
from app.recommendations.rules import RecommendationRuleRegistry


class RecommendationEngine:
    """Evidence-backed Product Recommendation Engine.
    
    Synthesizes concrete product action items backed by verified feedback observations,
    distinctly separating Observed data, Inferred patterns, and Recommended solutions.
    """

    def __init__(self, db: Session):
        self.db = db
        self.problem_repo = ProblemRepository(db)
        self.recommendation_repo = RecommendationRepository(db)

    def generate_recommendation_for_problem(self, problem_id: int) -> Recommendation:
        """Generate structured evidence-backed recommendation for a problem cluster."""
        problem = self.problem_repo.get_by_id(problem_id)
        if not problem:
            raise ValueError(f"Problem {problem_id} does not exist.")

        # Query all feedback records and analyses for this problem
        feedback_records = self.problem_repo.get_linked_feedback(problem_id, limit=200)

        # Extract dimensions
        dimensions = dimension_extractor.extract_dimensions_for_cluster(feedback_records)

        # Update problem dimensions in DB
        problem.product_dimension = dimensions
        self.db.commit()

        # Compute metrics
        total_count = len(feedback_records)
        neg_count = sum(1 for f in feedback_records if f.analysis and f.analysis.sentiment == "negative")
        neg_pct = (neg_count / float(total_count)) if total_count > 0 else 0.0
        growth_pct = problem.growth_rate or 0.0

        metrics = {
            "feedback_count": total_count,
            "negative_sentiment_pct": neg_pct,
            "growth_pct": growth_pct,
        }

        # Generate recommendation template
        tpl = RecommendationRuleRegistry.get_recommendation_template(
            problem_name=problem.name,
            dimensions=dimensions,
            metrics=metrics,
        )

        traceable_ids = [f.feedback_id for f in feedback_records[:20]]

        evidence_payload = {
            "observed": tpl["observed"],
            "inferred": tpl["inferred"],
            "feedback_count": total_count,
            "negative_sentiment_pct": round(neg_pct, 4),
            "growth_pct": round(growth_pct, 4),
            "affected_components": dimensions,
            "traceable_feedback_ids": traceable_ids,
        }

        confidence = round(min(0.98, 0.70 + (0.15 * min(1.0, total_count / 30.0))), 2)

        rec = self.recommendation_repo.create(
            problem_id=problem_id,
            recommendation=tpl["recommended"],
            reason=tpl["reason"],
            evidence=evidence_payload,
            confidence=confidence,
        )

        logger.info(f"Generated recommendation for Problem {problem_id} ('{problem.name}'). Confidence: {confidence}")
        return rec

    def generate_all_recommendations(self, account_id: Optional[str] = None) -> List[Recommendation]:
        """Generate recommendations for problem clusters scoped to a single account."""
        problems, _ = self.problem_repo.get_all(limit=1000, account_id=account_id)
        recommendations = []
        for p in problems:
            rec = self.generate_recommendation_for_problem(p.id)
            recommendations.append(rec)
        return recommendations
