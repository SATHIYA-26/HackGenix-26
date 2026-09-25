import json
import os
import sys
from typing import Optional, List, Dict, Any
from pathlib import Path
from datetime import datetime, timezone

# Ensure project root is in sys.path
current_dir = Path(__file__).resolve().parent
backend_dir = current_dir.parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

from app.core.config import settings
from app.core.logging import logger
from app.db.database import init_db, SessionLocal
from app.db.models import Feedback, ProblemCluster, Trend, Recommendation, Insight
from app.db.repositories.feedback_repository import FeedbackRepository
from app.db.repositories.problem_repository import ProblemRepository
from app.schemas.feedback import CanonicalFeedbackInput
from app.nlp.pipeline import NLPPipeline
from app.intelligence.insight_engine import IntelligenceCoordinator
from app.intelligence.evidence import TraceabilityEngine


if hasattr(sys.stdout, "reconfigure"):
    try:
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass


def run_seed_and_demo(limit_records: int = 530, mock_file_path: Optional[str] = None, fast_mode: bool = True):
    """Executes the complete end-to-end Feedback Intelligence pipeline:
    Loads 500+ records -> Ingestion -> Preprocessing -> RoBERTa Sentiment -> DistilBERT Intent
    -> BGE Embeddings -> HDBSCAN Clustering -> BERTopic Discovery -> Trends -> Explainable Priorities
    -> Recommendations -> LLM Insights -> Traceability Report.
    """
    if fast_mode:
        os.environ["ENVIRONMENT"] = "testing"

    print("\n" + "=" * 80, flush=True)
    print(" [*] FEEDBACK INTELLIGENCE PLATFORM -- END-TO-END DEMO SEED", flush=True)
    print("=" * 80 + "\n", flush=True)

    # 1. Initialize Database
    print("[1/7] Initializing Database & Extensions...")
    init_db()
    db = SessionLocal()

    try:
        feedback_repo = FeedbackRepository(db)
        problem_repo = ProblemRepository(db)

        # 2. Locate Mock Feedback JSON
        if not mock_file_path:
            candidates = [
                backend_dir / "data" / "mock_feedback.json",
                current_dir.parent / "data" / "mock_feedback.json",
                Path("data/mock_feedback.json"),
                Path("backend/data/mock_feedback.json"),
            ]
            for c in candidates:
                if c.exists():
                    mock_file_path = str(c.resolve())
                    break

        if not mock_file_path or not os.path.exists(mock_file_path):
            from scripts.generate_mock_data import generate_mock_feedback_data
            mock_file_path = str(backend_dir / "data" / "mock_feedback.json")
            generate_mock_feedback_data(mock_file_path, 530)

        with open(mock_file_path, "r", encoding="utf-8") as f:
            raw_data = json.load(f)

        records_to_load = raw_data[:limit_records]
        print(f"[2/7] Loaded {len(records_to_load)} mock records from '{mock_file_path}'.")

        # 3. Canonical Ingestion
        print("[3/7] Ingesting canonical feedback into database...")
        items = []
        for r in records_to_load:
            # Parse created_at
            dt_str = r["created_at"]
            try:
                dt = datetime.fromisoformat(dt_str)
            except Exception:
                dt = datetime.now(timezone.utc)

            items.append(
                CanonicalFeedbackInput(
                    feedback_id=r["feedback_id"],
                    source=r["source"],
                    source_url=r.get("source_url"),
                    text=r["text"],
                    rating=r.get("rating"),
                    created_at=dt,
                    metadata=r.get("metadata") or {},
                )
            )

        ingested = feedback_repo.create_batch(items)
        print(f"      Ingested {len(ingested)} new records. (Total in DB: {feedback_repo.count()})")

        # 4. Run Batch NLP Pipeline
        print("[4/7] Running NLP Pipeline (Preprocessing, RoBERTa Sentiment, DistilBERT Intent, BGE Embeddings)...")
        pipeline = NLPPipeline(db)
        feedback_ids = [item.feedback_id for item in items]
        analyses = pipeline.process_batch(feedback_ids)
        print(f"      Enriched {len(analyses)} items with sentiment, intent, and 768-D semantic vectors.")

        # 5. HDBSCAN Density Clustering & BERTopic Discovery
        print("[5/7] Executing HDBSCAN density clustering & BERTopic problem discovery...")
        discovered_problems = pipeline.discover_problems()
        print(f"      Discovered {len(discovered_problems)} distinct problem clusters.")

        # 6. Trend Detection, Priority Engine, Recommendations & LLM Insights
        print("[6/7] Running Intelligence Cycle (Trends, Explainable Priorities, Recommendations, LLM Insights)...")
        coordinator = IntelligenceCoordinator(db)
        cycle_metrics = coordinator.run_full_intelligence_cycle()
        print(f"      Processed {cycle_metrics['trends_count']} trends, {cycle_metrics['priorities_count']} priorities, "
              f"{cycle_metrics['recommendations_count']} recommendations, {cycle_metrics['insights_count']} executive insights.")

        # 7. Print Executive Traceability Demonstration
        print("\n" + "=" * 80)
        print(" [*] TOP ACTIONABLE INTELLIGENCE -- TRACEABLE EXECUTIVE BRIEF")
        print("=" * 80 + "\n")

        trace_engine = TraceabilityEngine(db)
        top_problems, _ = problem_repo.get_all(skip=0, limit=3, sort_by_priority=True)

        for p in top_problems:
            audit = trace_engine.get_problem_audit_trail(p.id)
            prob_info = audit["problem"]
            rec_info = audit["recommendation"]
            insight_info = audit["insight"]
            audit_trail = audit["audit_trail"]

            dims = prob_info.get("product_dimensions") or {}
            platform_str = dims.get("platform", "Android").title() if isinstance(dims, dict) else "Android"
            version_str = dims.get("version", "4.2.1") if isinstance(dims, dict) else "4.2.1"
            feature_str = dims.get("feature", "Checkout").title() if isinstance(dims, dict) else "Checkout"

            print(f"Problem:            {prob_info['name']}")
            print(f"Feedback Count:     {prob_info['feedback_count']} customer complaints")
            print(f"Negative Sentiment: {abs(p.negative_sentiment_score):.0%}")
            print(f"Growth Velocity:    {prob_info['growth_rate']:+.0%}")
            print(f"Priority Score:     {prob_info['priority_score']:.2f} / 1.00 [EXPLAINABLE]")
            print(f"Affected Scope:     {platform_str} / {feature_str} / v{version_str}")
            print(f"\nEvidence Summary:")
            print(f"  {audit_trail['total_linked_items']} linked customer feedback items across {', '.join(audit_trail['sources_represented'])}")
            print(f"\nProduct Recommendation [Observed -> Inferred -> Recommended]:")
            print(f"  {rec_info['recommendation']}")
            print(f"\nExecutive LLM Insight:")
            print(f"  {insight_info['summary']}")
            print(f"\nSuggested Customer Support Response:")
            print(f"  \"{insight_info['suggested_response']}\"")
            print(f"\nTraceability Links:")
            sample_ids = [f['feedback_id'] for f in audit_trail['sample_feedback_items'][:5]]
            sample_urls = [url for url in audit_trail['source_urls'][:3]]
            print(f"  Feedback IDs: {sample_ids}")
            print(f"  Source URLs:  {sample_urls}")
            print("-" * 80 + "\n")

        print(" Demo run completed successfully! Backend is fully populated and operational.\n")

    finally:
        db.close()


if __name__ == "__main__":
    from typing import Optional
    run_seed_and_demo()
