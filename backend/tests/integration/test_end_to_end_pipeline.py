from datetime import datetime, timedelta, timezone

from app.schemas.feedback import CanonicalFeedbackInput
from app.db.repositories.feedback_repository import FeedbackRepository
from app.db.repositories.problem_repository import ProblemRepository
from app.nlp.pipeline import NLPPipeline
from app.intelligence.insight_engine import IntelligenceCoordinator
from app.intelligence.evidence import TraceabilityEngine


def test_end_to_end_intelligence_lifecycle(db_session, client):
    """Integration test validating complete pipeline:
    Feedback Ingestion -> NLP -> Clustering -> Trends -> Priority -> Recommendation -> LLM Insight -> Traceability -> Dashboard.
    """
    now = datetime.now(timezone.utc)
    fb_repo = FeedbackRepository(db_session)
    prob_repo = ProblemRepository(db_session)

    # 1. Ingest batch of feedback representing emerging UPI failure
    raw_feedbacks = [
        # Previous window items (8 days ago)
        CanonicalFeedbackInput(
            feedback_id="e2e_prev_1",
            source="youtube",
            source_url="https://youtube.com/watch?v=prev1",
            text="UPI payment failed during checkout",
            rating=1.0,
            created_at=now - timedelta(days=8),
            metadata={"platform": "android", "version": "4.2.1", "feature": "checkout"},
        ),
        CanonicalFeedbackInput(
            feedback_id="e2e_prev_2",
            source="google_play",
            source_url="https://play.google.com/review/prev2",
            text="Payment through UPI is not working",
            rating=1.0,
            created_at=now - timedelta(days=9),
            metadata={"platform": "android", "version": "4.2.1", "feature": "checkout"},
        ),
        # Current window surge items (1-3 days ago)
        CanonicalFeedbackInput(
            feedback_id="e2e_curr_1",
            source="youtube",
            source_url="https://youtube.com/watch?v=curr1",
            text="Money got deducted from my bank but order was cancelled",
            rating=1.0,
            created_at=now - timedelta(days=2),
            metadata={"platform": "android", "version": "4.2.1", "feature": "checkout"},
        ),
        CanonicalFeedbackInput(
            feedback_id="e2e_curr_2",
            source="app_store",
            source_url="https://apps.apple.com/review/curr2",
            text="Why is UPI broken again? Every transaction fails",
            rating=1.0,
            created_at=now - timedelta(days=1),
            metadata={"platform": "android", "version": "4.2.1", "feature": "checkout"},
        ),
        CanonicalFeedbackInput(
            feedback_id="e2e_curr_3",
            source="support_ticket",
            source_url="https://desk.company.com/tickets/curr3",
            text="The app freezes when I try to pay via UPI",
            rating=1.0,
            created_at=now - timedelta(days=1),
            metadata={"platform": "android", "version": "4.2.1", "feature": "checkout"},
        ),
        CanonicalFeedbackInput(
            feedback_id="e2e_curr_4",
            source="youtube",
            source_url="https://youtube.com/watch?v=curr4",
            text="UPI transaction timed out but money left account",
            rating=1.0,
            created_at=now - timedelta(days=1),
            metadata={"platform": "android", "version": "4.2.1", "feature": "checkout"},
        ),
        CanonicalFeedbackInput(
            feedback_id="e2e_curr_5",
            source="google_play",
            source_url="https://play.google.com/review/curr5",
            text="UPI error 504 gateway timeout every single time",
            rating=1.0,
            created_at=now - timedelta(days=2),
            metadata={"platform": "android", "version": "4.2.1", "feature": "checkout"},
        ),
        CanonicalFeedbackInput(
            feedback_id="e2e_curr_6",
            source="survey",
            text="Paid via UPI, money debited, but order status is still pending",
            rating=1.0,
            created_at=now - timedelta(days=1),
            metadata={"platform": "android", "version": "4.2.1", "feature": "checkout"},
        ),
        # Distinct category (Delivery)
        CanonicalFeedbackInput(
            feedback_id="e2e_del_1",
            source="youtube",
            text="Delivery delayed by 4 days without any notification",
            rating=2.0,
            created_at=now - timedelta(days=3),
            metadata={"platform": "ios", "feature": "delivery"},
        ),
        # Noise
        CanonicalFeedbackInput(
            feedback_id="e2e_noise_1",
            source="youtube",
            text="nice",
            rating=None,
            created_at=now - timedelta(days=1),
        ),
    ]

    # Ingest
    ingested = fb_repo.create_batch(raw_feedbacks)
    assert len(ingested) == 10

    # 2. Run NLP Pipeline
    pipeline = NLPPipeline(db_session)
    feedback_ids = [f.feedback_id for f in raw_feedbacks]
    analyses = pipeline.process_batch(feedback_ids)
    assert len(analyses) == 10

    # 3. Discover Problems
    problems = pipeline.discover_problems()
    assert len(problems) >= 1

    # 4. Run Full Intelligence Cycle
    coordinator = IntelligenceCoordinator(db_session)
    cycle_res = coordinator.run_full_intelligence_cycle()
    assert cycle_res["trends_count"] >= 1
    assert cycle_res["priorities_count"] >= 1
    assert cycle_res["recommendations_count"] >= 1
    assert cycle_res["insights_count"] >= 1

    # 5. Verify Traceability
    top_problem = problems[0]
    trace_engine = TraceabilityEngine(db_session)
    audit = trace_engine.get_problem_audit_trail(top_problem.id)

    assert audit["problem"]["id"] == top_problem.id
    assert audit["recommendation"]["id"] is not None
    assert audit["insight"]["id"] is not None
    assert audit["audit_trail"]["total_linked_items"] >= 1
    assert len(audit["audit_trail"]["source_urls"]) >= 1

    # 6. Verify Dashboard Summary API reflects the state
    dash_res = client.get("/api/v1/dashboard/summary")
    assert dash_res.status_code == 200
    dash_data = dash_res.json()
    assert dash_data["total_feedback"] >= 10
    assert dash_data["analyzed_feedback"] >= 10
    assert len(dash_data["top_priority_problems"]) >= 1
