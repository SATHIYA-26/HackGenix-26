import json
from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session

from app.core.logging import logger
from app.db.models import ProblemCluster, Insight, Feedback, FeedbackAnalysis, problem_feedback
from app.db.repositories.problem_repository import ProblemRepository
from app.db.repositories.insight_repository import InsightRepository
from app.intelligence.feature_extraction import dimension_extractor
from app.llm.client import LLMClient
from app.llm.prompts import SYSTEM_PROMPT, build_insight_prompt


class LLMInsightService:
    """Service for generating traceable executive insights and customer response recommendations.
    
    Uses OpenAI-compatible LLM when configured, with robust deterministic synthesis
    fallback if the API key is not supplied or offline.
    """

    def __init__(self, db: Session):
        self.db = db
        self.problem_repo = ProblemRepository(db)
        self.insight_repo = InsightRepository(db)
        self.client = LLMClient()

    def generate_insight_for_problem(self, problem_id: int) -> Insight:
        """Synthesize executive problem insight, action items, and customer response template."""
        problem = self.problem_repo.get_by_id(problem_id)
        if not problem:
            raise ValueError(f"Problem {problem_id} does not exist.")

        # Get linked feedback
        feedback_items = self.problem_repo.get_linked_feedback(problem_id, limit=50)
        sample_texts = [f.text for f in feedback_items[:5]]
        traceable_ids = [f.feedback_id for f in feedback_items[:20]]

        # Dimensions & metrics
        dimensions = dimension_extractor.extract_dimensions_for_cluster(feedback_items)
        neg_count = sum(1 for f in feedback_items if f.analysis and f.analysis.sentiment == "negative")
        neg_pct = (neg_count / float(len(feedback_items))) if feedback_items else 0.0

        # Try LLM inference first if client is configured
        insight_data = None
        if self.client.is_available:
            try:
                user_prompt = build_insight_prompt(
                    problem_name=problem.name,
                    feedback_count=len(feedback_items),
                    avg_sentiment=problem.average_sentiment,
                    neg_pct=neg_pct,
                    growth_rate=problem.growth_rate,
                    priority_score=problem.priority_score,
                    priority_explanation=f"Calculated priority score {problem.priority_score:.2f}",
                    dimensions=dimensions,
                    sample_feedback_texts=sample_texts,
                )
                raw_json = self.client.generate_chat_completion(SYSTEM_PROMPT, user_prompt)
                insight_data = json.loads(raw_json)
                logger.info(f"LLM successfully generated structured insight for Problem {problem_id}.")
            except Exception as exc:
                logger.warning(f"LLM insight generation failed or fell back: {exc}. Using deterministic synthesis.")

        # Deterministic evidence synthesis fallback if LLM not available
        if not insight_data:
            insight_data = self._deterministic_fallback_insight(
                problem=problem,
                feedback_items=feedback_items,
                dimensions=dimensions,
                neg_pct=neg_pct,
                traceable_ids=traceable_ids,
            )

        # Ensure traceable feedback IDs are stored in the evidence payload
        evidence_payload = insight_data.get("evidence", {})
        evidence_payload["traceable_feedback_ids"] = traceable_ids
        evidence_payload["total_linked_feedback"] = len(feedback_items)
        evidence_payload["source_urls"] = [f.source_url for f in feedback_items if f.source_url][:10]

        # Save or update Insight record
        insight = self.insight_repo.create_or_update(
            problem_id=problem_id,
            summary=insight_data.get("summary", f"Investigation into {problem.name}"),
            why_it_matters=insight_data.get("why_it_matters", "Critical user friction affecting satisfaction."),
            evidence=evidence_payload,
            recommended_actions=insight_data.get("recommended_actions", ["Investigate logs", "Audit client version"]),
            suggested_response=insight_data.get("suggested_response"),
        )

        return insight

    def _deterministic_fallback_insight(
        self,
        problem: ProblemCluster,
        feedback_items: List[Feedback],
        dimensions: Dict[str, Any],
        neg_pct: float,
        traceable_ids: List[str],
    ) -> Dict[str, Any]:
        """High-fidelity deterministic executive insight generator."""
        count = len(feedback_items)
        platform = dimensions.get("platform") or "all platforms"
        version = dimensions.get("version") or "latest version"
        feature = dimensions.get("feature") or "core workflow"
        growth = problem.growth_rate or 0.0

        quotes = [f.text for f in feedback_items[:3]]

        summary = (
            f"Customer complaints report recurring failures in '{problem.name}'. "
            f"The issue is predominantly observed on {platform.title()} (version {version}), "
            f"with {count} documented feedback instances exhibiting a {neg_pct:.0%} negative sentiment ratio."
        )

        why_it_matters = (
            f"This friction directly impedes the user journey in {feature}. "
            f"With a {growth:+.0%} growth trajectory and a priority score of {problem.priority_score:.2f}, "
            "unresolved occurrences pose an immediate risk of customer churn and app rating deterioration."
        )

        recommended_actions = [
            f"Perform an immediate diagnostic audit of the {feature} service on {platform.title()}.",
            f"Inspect release telemetry for client version {version} for unhandled exceptions.",
            "Deploy an automated monitoring alert for spike detection on payment/auth gateway response codes.",
            "Empower frontline support agents with standard one-click refund/reset workflows.",
        ]

        suggested_response = (
            f"Hello, we sincerely apologize for the inconvenience with your experience on {platform.title()}. "
            "Our engineering team has identified this issue and is actively preparing a hotfix. "
            "If your transaction or order was affected, please reach out to support@company.com with your details "
            "for immediate priority resolution."
        )

        return {
            "summary": summary,
            "why_it_matters": why_it_matters,
            "evidence": {
                "total_feedback": count,
                "negative_sentiment_pct": round(neg_pct, 4),
                "growth_pct": round(growth, 4),
                "affected_platform": platform,
                "affected_version": version,
                "key_quotes": quotes,
            },
            "potential_contributing_areas": [
                f"Client networking timeout thresholds on {platform}",
                f"Asynchronous webhook confirmation latency in {feature}",
            ],
            "recommended_actions": recommended_actions,
            "suggested_response": suggested_response,
        }
