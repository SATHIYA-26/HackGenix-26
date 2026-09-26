from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session

from app.core.logging import logger
from app.db.models import ProblemCluster, Trend, Recommendation, Insight
from app.intelligence.trend_detection import TrendDetectionEngine
from app.intelligence.priority_engine import ExplainablePriorityEngine
from app.recommendations.engine import RecommendationEngine
from app.llm.service import LLMInsightService
from app.intelligence.evidence import TraceabilityEngine


class IntelligenceCoordinator:
    """Master intelligence orchestrator.
    
    Sequentially runs:
    1. Trend Detection (volume shifts, velocity, emerging flags)
    2. Explainable Priority Engine (weighted multi-factor calculation & rationale)
    3. Recommendation Engine (evidence-backed Observed/Inferred/Recommended actions)
    4. LLM Insight Engine (structured executive summaries and customer responses)
    """

    def __init__(self, db: Session):
        self.db = db
        self.trend_engine = TrendDetectionEngine(db)
        self.priority_engine = ExplainablePriorityEngine(db)
        self.recommendation_engine = RecommendationEngine(db)
        self.llm_service = LLMInsightService(db)
        self.traceability_engine = TraceabilityEngine(db)

    def run_full_intelligence_cycle(self, account_id: Optional[str] = None) -> Dict[str, Any]:
        """Execute the end-to-end intelligence cycle scoped to a single account's problem clusters."""
        scope_label = f"account '{account_id}'" if account_id else "ALL accounts"
        logger.info(f"Starting Full Intelligence Cycle for {scope_label}...")

        # 1. Trends
        trends = self.trend_engine.analyze_all_problems(account_id=account_id)
        logger.info(f"Analyzed trends for {len(trends)} problems.")

        # 2. Priorities
        priorities = self.priority_engine.calculate_all_priorities(account_id=account_id)
        logger.info(f"Calculated explainable priorities for {len(priorities)} problems.")

        # 3. Recommendations
        recommendations = self.recommendation_engine.generate_all_recommendations(account_id=account_id)
        logger.info(f"Generated {len(recommendations)} evidence-backed recommendations.")

        # 4. LLM Insights
        insights = []
        for problem_id in priorities.keys():
            insight = self.llm_service.generate_insight_for_problem(problem_id)
            insights.append(insight)
        logger.info(f"Generated {len(insights)} LLM executive insights.")

        return {
            "trends_count": len(trends),
            "priorities_count": len(priorities),
            "recommendations_count": len(recommendations),
            "insights_count": len(insights),
        }
