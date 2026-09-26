from typing import Dict, Any, List, Optional
import math
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.logging import logger
from app.db.models import ProblemCluster, Feedback, FeedbackAnalysis, problem_feedback
from app.db.repositories.problem_repository import ProblemRepository
from app.schemas.problem import PriorityBreakdown


class ExplainablePriorityEngine:
    """Explainable Multi-Factor Priority Scoring Engine.
    
    Calculates transparent, fully explainable priority scores using normalized factors:
    - Frequency: Volume of customer feedback items
    - Severity: Functional severity based on issue domain (payments, crashes, auth)
    - Growth: Velocity of complaint surge over time
    - User Impact: Cross-platform and version breadth
    - Negative Sentiment: Ratio and intensity of negative sentiment
    """

    def __init__(self, db: Session):
        self.db = db
        self.problem_repo = ProblemRepository(db)

        # Configurable weights (normalized sum = 1.0)
        self.w_frequency = settings.PRIORITY_WEIGHT_FREQUENCY             # 0.25
        self.w_severity = settings.PRIORITY_WEIGHT_SEVERITY               # 0.25
        self.w_growth = settings.PRIORITY_WEIGHT_GROWTH                   # 0.20
        self.w_user_impact = settings.PRIORITY_WEIGHT_USER_IMPACT         # 0.15
        self.w_negative_sentiment = settings.PRIORITY_WEIGHT_NEGATIVE_SENTIMENT # 0.15

    def calculate_priority_for_problem(
        self,
        problem_id: int,
        max_benchmark_count: int = 100,
    ) -> PriorityBreakdown:
        """Calculate normalized priority components and natural language explanation for a problem."""
        problem = self.problem_repo.get_by_id(problem_id)
        if not problem:
            raise ValueError(f"Problem {problem_id} not found.")

        # Query all feedback analysis records for this problem
        analyses = (
            self.db.query(FeedbackAnalysis, Feedback)
            .join(problem_feedback, problem_feedback.c.feedback_id == FeedbackAnalysis.feedback_id)
            .join(Feedback, Feedback.feedback_id == FeedbackAnalysis.feedback_id)
            .filter(problem_feedback.c.problem_id == problem_id)
            .all()
        )

        total_count = len(analyses)

        # 1. Normalized Frequency Score (logistic/asymptotic scaling up to 1.0)
        freq_norm = min(1.0, total_count / float(max(10, max_benchmark_count)))

        # 2. Negative Sentiment Score (proportion of negative feedback items)
        if total_count > 0:
            neg_count = sum(1 for a, _ in analyses if a.sentiment == "negative")
            neg_sentiment_norm = neg_count / float(total_count)
        else:
            neg_sentiment_norm = 0.50

        # 3. Normalized Severity Score (domain criticality: payments > crashes > auth > delivery > ui)
        severity_norm = self._infer_domain_severity(problem.name, analyses)

        # 4. Growth Rate Score (normalized: 0% -> 0.4, 50% -> 0.75, 100%+ -> 1.0)
        growth_rate = problem.growth_rate or 0.0
        if growth_rate <= 0:
            growth_norm = max(0.1, 0.4 + growth_rate * 0.3)
        else:
            growth_norm = min(1.0, 0.4 + (growth_rate * 0.6))

        # 5. User Impact Score (platform breadth and volume weight)
        platforms = set()
        versions = set()
        for _, f in analyses:
            meta = f.extra_metadata or {}
            if meta.get("platform"):
                platforms.add(meta["platform"])
            if meta.get("version"):
                versions.add(meta["version"])

        platform_factor = min(1.0, len(platforms) * 0.35)
        user_impact_norm = min(1.0, 0.4 * platform_factor + 0.6 * freq_norm)

        # Weighted Composite Priority Calculation
        composite_priority = (
            (self.w_frequency * freq_norm)
            + (self.w_severity * severity_norm)
            + (self.w_growth * growth_norm)
            + (self.w_user_impact * user_impact_norm)
            + (self.w_negative_sentiment * neg_sentiment_norm)
        )
        composite_priority = round(min(1.0, max(0.0, composite_priority)), 4)

        # Generate Explainability Rationale
        explanation = self._generate_explanation(
            name=problem.name,
            priority=composite_priority,
            freq=freq_norm,
            sev=severity_norm,
            growth=growth_norm,
            growth_pct=growth_rate,
            neg_sent=neg_sentiment_norm,
            count=total_count,
        )

        # Update problem record in DB
        problem.priority_score = composite_priority
        problem.frequency_score = round(freq_norm, 4)
        problem.severity_score = round(severity_norm, 4)
        problem.growth_score = round(growth_norm, 4)
        problem.user_impact_score = round(user_impact_norm, 4)
        problem.negative_sentiment_score = round(neg_sentiment_norm, 4)
        self.db.commit()

        return PriorityBreakdown(
            frequency=round(freq_norm, 4),
            severity=round(severity_norm, 4),
            growth=round(growth_norm, 4),
            user_impact=round(user_impact_norm, 4),
            negative_sentiment=round(neg_sentiment_norm, 4),
            priority_score=composite_priority,
            explanation=explanation,
        )

    def _infer_domain_severity(self, problem_name: str, analyses: List[Any]) -> float:
        """Infer base technical and financial severity based on problem characteristics."""
        name_lower = problem_name.lower()

        # Payment failures are critical severity (revenue & user trust loss)
        if any(w in name_lower for w in ["upi", "payment", "deduct", "billing", "charges"]):
            return 0.95
        # Authentication / login blocks user access completely
        elif any(w in name_lower for w in ["login", "otp", "auth", "password"]):
            return 0.90
        # Application crashes cause total task abandonment
        elif any(w in name_lower for w in ["crash", "force close", "freeze"]):
            return 0.85
        # Delivery issues damage fulfillment trust
        elif any(w in name_lower for w in ["delivery", "courier", "rider"]):
            return 0.75
        # Performance / latency
        elif any(w in name_lower for w in ["slow", "latency", "hang"]):
            return 0.70
        # Pricing complaints
        elif any(w in name_lower for w in ["fee", "price", "discount"]):
            return 0.65
        # UI / cosmetic complaints
        elif any(w in name_lower for w in ["dark mode", "font", "ui", "layout"]):
            return 0.45

        return 0.55

    def _generate_explanation(
        self,
        name: str,
        priority: float,
        freq: float,
        sev: float,
        growth: float,
        growth_pct: float,
        neg_sent: float,
        count: int,
    ) -> str:
        """Produce a human-readable explanation of why the priority score was assigned."""
        urgency = "CRITICAL" if priority >= 0.75 else ("HIGH" if priority >= 0.60 else ("MEDIUM" if priority >= 0.40 else "LOW"))

        reasons = []
        if sev >= 0.85:
            reasons.append("directly affects financial transactions or user authentication")
        if growth_pct >= 0.50:
            reasons.append(f"experienced an accelerating complaint surge of +{growth_pct:.0%}")
        if neg_sent >= 0.80:
            reasons.append(f"{neg_sent:.0%} of related user feedback is strongly negative")
        if count >= 30:
            reasons.append(f"high customer volume ({count} linked feedback records)")

        if not reasons:
            reasons.append("moderate feedback volume and stability")

        return (
            f"Rated {urgency} priority ({priority:.2f}) because it "
            + "; ".join(reasons)
            + "."
        )

    def calculate_all_priorities(self, account_id: Optional[str] = None) -> Dict[int, PriorityBreakdown]:
        """Compute explainable priority scores for problem clusters scoped to a single account."""
        problems, _ = self.problem_repo.get_all(limit=1000, account_id=account_id)
        max_count = max([p.feedback_count for p in problems], default=50)

        results = {}
        for p in problems:
            breakdown = self.calculate_priority_for_problem(p.id, max_benchmark_count=max_count)
            results[p.id] = breakdown
        return results
