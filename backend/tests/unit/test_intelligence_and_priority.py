from datetime import datetime, timedelta, timezone
import pytest

from app.db.models import Feedback, FeedbackAnalysis, ProblemCluster
from app.schemas.feedback import CanonicalFeedbackInput
from app.db.repositories.feedback_repository import FeedbackRepository
from app.db.repositories.problem_repository import ProblemRepository

from app.intelligence.feature_extraction import dimension_extractor
from app.intelligence.trend_detection import TrendDetectionEngine
from app.intelligence.priority_engine import ExplainablePriorityEngine
from app.intelligence.evidence import TraceabilityEngine
from app.recommendations.engine import RecommendationEngine
from app.llm.service import LLMInsightService


def test_dimension_extractor(db_session):
    now = datetime.now(timezone.utc)
    feedbacks = [
        Feedback(
            feedback_id="dim_01",
            source="youtube",
            text="UPI payment failed on Android app v4.2.1 checkout",
            created_at=now,
            extra_metadata={"platform": "android", "version": "4.2.1", "feature": "checkout"},
        ),
        Feedback(
            feedback_id="dim_02",
            source="google_play",
            text="Checkout hangs on Android 14",
            created_at=now,
            extra_metadata={"platform": "android", "version": "4.2.1"},
        ),
    ]
    dims = dimension_extractor.extract_dimensions_for_cluster(feedbacks)
    assert dims["platform"] == "android"
    assert dims["version"] == "4.2.1"
    assert dims["feature"] == "checkout"


def test_trend_detection_engine(db_session):
    now = datetime.now(timezone.utc)
    prob_repo = ProblemRepository(db_session)
    fb_repo = FeedbackRepository(db_session)

    problem = prob_repo.create_or_update(
        name="UPI Payment Failure",
        description="UPI timeouts during checkout",
        feedback_count=15,
        average_sentiment=-0.8,
        growth_rate=0.0,
        severity=0.9,
        user_impact=0.8,
        priority_score=0.85,
    )

    # Add 2 items in previous window (10 days ago)
    for i in range(2):
        fid = f"prev_{i}"
        fb_repo.create(
            CanonicalFeedbackInput(
                feedback_id=fid,
                source="youtube",
                text="UPI payment failed",
                created_at=now - timedelta(days=10),
            )
        )
        prob_repo.link_feedback(problem.id, fid)

    # Add 8 items in current window (2 days ago) -> surge!
    for i in range(8):
        fid = f"curr_{i}"
        fb_repo.create(
            CanonicalFeedbackInput(
                feedback_id=fid,
                source="youtube",
                text="UPI payment failed again",
                created_at=now - timedelta(days=2),
            )
        )
        prob_repo.link_feedback(problem.id, fid)

    trend_engine = TrendDetectionEngine(db_session)
    trend = trend_engine.analyze_problem_trend(problem.id, window_days=7, reference_time=now)

    assert trend.current_count == 8
    assert trend.previous_count == 2
    assert trend.growth_rate == 3.0  # +300% growth
    assert trend.is_emerging is True  # Count >= 5 and growth >= 50%


def test_explainable_priority_engine(db_session):
    now = datetime.now(timezone.utc)
    prob_repo = ProblemRepository(db_session)
    fb_repo = FeedbackRepository(db_session)

    problem = prob_repo.create_or_update(
        name="UPI Payment Gateway Timeout",
        description="High severity payment issues",
        feedback_count=20,
        average_sentiment=-0.9,
        growth_rate=0.8,
        severity=0.95,
        user_impact=0.85,
        priority_score=0.0,
    )

    # Link feedback items with analyses
    for i in range(10):
        fid = f"pri_{i}"
        fb_repo.create(
            CanonicalFeedbackInput(
                feedback_id=fid,
                source="youtube",
                text="UPI failed completely",
                created_at=now,
                metadata={"platform": "android", "version": "4.2.1"},
            )
        )
        fb_repo.save_analysis(
            feedback_id=fid,
            sentiment="negative",
            sentiment_confidence=0.95,
            intent="payment_issue",
            intent_confidence=0.92,
            cleaned_text="upi failed completely",
        )
        prob_repo.link_feedback(problem.id, fid)

    priority_engine = ExplainablePriorityEngine(db_session)
    breakdown = priority_engine.calculate_priority_for_problem(problem.id)

    assert 0.0 <= breakdown.priority_score <= 1.0
    assert breakdown.severity >= 0.85  # Payment issue has high severity
    assert breakdown.negative_sentiment >= 0.90
    assert "CRITICAL" in breakdown.explanation or "HIGH" in breakdown.explanation
    assert "financial transactions" in breakdown.explanation


def test_recommendation_and_traceability_engine(db_session):
    now = datetime.now(timezone.utc)
    prob_repo = ProblemRepository(db_session)
    fb_repo = FeedbackRepository(db_session)

    problem = prob_repo.create_or_update(
        name="UPI Payment Failure",
        description="Payment timeouts",
        feedback_count=10,
        average_sentiment=-0.9,
        growth_rate=0.7,
        severity=0.95,
        user_impact=0.85,
        priority_score=0.88,
    )

    for i in range(5):
        fid = f"rec_f_{i}"
        fb_repo.create(
            CanonicalFeedbackInput(
                feedback_id=fid,
                source="youtube",
                source_url=f"https://youtube.com/watch?v=rec_{i}",
                text="Money got deducted but order was cancelled",
                created_at=now,
                metadata={"platform": "android", "version": "4.2.1", "feature": "checkout"},
            )
        )
        fb_repo.save_analysis(
            feedback_id=fid,
            sentiment="negative",
            sentiment_confidence=0.95,
            intent="payment_issue",
            intent_confidence=0.9,
            cleaned_text="money got deducted but order was cancelled",
        )
        prob_repo.link_feedback(problem.id, fid)

    rec_engine = RecommendationEngine(db_session)
    rec = rec_engine.generate_recommendation_for_problem(problem.id)

    assert rec.recommendation is not None
    assert rec.reason is not None
    assert "observed" in rec.evidence
    assert "inferred" in rec.evidence
    assert len(rec.evidence["traceable_feedback_ids"]) >= 1

    # Test LLM Insight generation (deterministic fallback)
    llm_service = LLMInsightService(db_session)
    insight = llm_service.generate_insight_for_problem(problem.id)

    assert insight.summary is not None
    assert insight.why_it_matters is not None
    assert len(insight.recommended_actions) >= 1
    assert insight.suggested_response is not None
    assert "traceable_feedback_ids" in insight.evidence

    # Test Traceability Engine
    trace_engine = TraceabilityEngine(db_session)
    audit = trace_engine.get_problem_audit_trail(problem.id)

    assert audit["problem"]["id"] == problem.id
    assert audit["recommendation"]["id"] == rec.id
    assert audit["insight"]["id"] == insight.id
    assert len(audit["audit_trail"]["sample_feedback_items"]) >= 1
    assert any("https://youtube.com" in url for url in audit["audit_trail"]["source_urls"])
