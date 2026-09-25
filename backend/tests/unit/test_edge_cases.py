from datetime import datetime, timezone
import pytest
from pydantic import ValidationError

from app.schemas.feedback import CanonicalFeedbackInput
from app.db.models import Feedback, ProblemCluster
from app.db.repositories.feedback_repository import FeedbackRepository
from app.db.repositories.problem_repository import ProblemRepository
from app.nlp.pipeline import NLPPipeline
from app.nlp.clustering import SemanticClusteringService
from app.llm.service import LLMInsightService
from app.intelligence.priority_engine import ExplainablePriorityEngine


def test_empty_feedback_rejected():
    """Verify empty text or whitespace-only is strictly rejected."""
    with pytest.raises(ValidationError):
        CanonicalFeedbackInput(
            feedback_id="edge_empty_1",
            source="youtube",
            text="",
            created_at=datetime.now(timezone.utc),
        )

    with pytest.raises(ValidationError):
        CanonicalFeedbackInput(
            feedback_id="edge_empty_2",
            source="youtube",
            text="       \t\n  ",
            created_at=datetime.now(timezone.utc),
        )


def test_extremely_long_feedback_handled(db_session):
    """Verify 4,000+ character feedback item is ingested, normalized, and embedded without crash."""
    long_text = "UPI payment failed on checkout. " * 150  # ~4,800 characters
    now = datetime.now(timezone.utc)

    repo = FeedbackRepository(db_session)
    item = repo.create(
        CanonicalFeedbackInput(
            feedback_id="edge_long_1",
            source="support_ticket",
            text=long_text,
            created_at=now,
        )
    )
    assert item.id is not None

    pipeline = NLPPipeline(db_session)
    analysis = pipeline.process_feedback_item(item.feedback_id)
    assert analysis is not None
    assert analysis.sentiment == "negative"
    assert analysis.intent == "payment_issue"


def test_missing_rating_and_missing_metadata(db_session):
    """Verify optional fields (rating=None, metadata={}) operate correctly."""
    repo = FeedbackRepository(db_session)
    item = repo.create(
        CanonicalFeedbackInput(
            feedback_id="edge_none_1",
            source="survey",
            text="Simple survey comment with no rating or metadata",
            rating=None,
            metadata=None,
            created_at=datetime.now(timezone.utc),
        )
    )
    assert item.id is not None
    assert item.rating is None
    assert item.extra_metadata == {}


def test_only_positive_feedback_cluster(db_session):
    """Verify a cluster with 100% positive sentiment produces low severity and high average sentiment."""
    prob_repo = ProblemRepository(db_session)
    fb_repo = FeedbackRepository(db_session)
    now = datetime.now(timezone.utc)

    problem = prob_repo.create_or_update(
        name="Customer Praise for UI",
        description="Positive feedback",
        feedback_count=10,
        average_sentiment=1.0,
        growth_rate=0.1,
        severity=0.3,
        user_impact=0.4,
        priority_score=0.3,
    )

    for i in range(5):
        fid = f"pos_f_{i}"
        fb_repo.create(
            CanonicalFeedbackInput(
                feedback_id=fid,
                source="app_store",
                text="Loved the fast checkout and clean UI ❤️",
                rating=5.0,
                created_at=now,
            )
        )
        fb_repo.save_analysis(
            feedback_id=fid,
            sentiment="positive",
            sentiment_confidence=0.98,
            intent="ui_ux",
            intent_confidence=0.9,
            cleaned_text="loved the fast checkout and clean ui ❤️",
        )
        prob_repo.link_feedback(problem.id, fid)

    priority_engine = ExplainablePriorityEngine(db_session)
    breakdown = priority_engine.calculate_priority_for_problem(problem.id)

    assert breakdown.negative_sentiment == 0.0
    assert breakdown.priority_score <= 0.60
    assert "LOW" in breakdown.explanation or "MEDIUM" in breakdown.explanation


def test_insufficient_data_for_clustering(db_session):
    """Verify clustering gracefully handles < 5 items without throwing exceptions."""
    pipeline = NLPPipeline(db_session)
    # Database has fewer than 5 items
    clusters = pipeline.discover_problems()
    assert isinstance(clusters, list)


def test_all_feedback_being_outliers():
    """Verify HDBSCAN returns empty cluster dict and outlier IDs when all points are noise/outliers."""
    clustering_service = SemanticClusteringService(min_cluster_size=10, min_samples=5)
    # Only 3 random orthogonal vectors (insufficient to form a cluster of 10)
    embeddings = [
        [1.0 if j == i else 0.0 for j in range(768)]
        for i in range(3)
    ]
    f_ids = ["o_1", "o_2", "o_3"]
    texts = ["unique random text one", "completely unrelated second string", "third disjoint sentence"]

    clusters, outliers = clustering_service.fit_predict(embeddings, f_ids, texts)
    assert len(clusters) == 0
    assert len(outliers) == 3


def test_llm_unavailable_deterministic_fallback(db_session):
    """Verify LLMInsightService runs cleanly and produces structured results when OpenAI is not configured."""
    prob_repo = ProblemRepository(db_session)
    fb_repo = FeedbackRepository(db_session)
    now = datetime.now(timezone.utc)

    problem = prob_repo.create_or_update(
        name="Checkout Crash",
        description="App crashes on button press",
        feedback_count=6,
        average_sentiment=-0.85,
        growth_rate=0.4,
        severity=0.85,
        user_impact=0.7,
        priority_score=0.75,
    )

    for i in range(3):
        fid = f"fb_llm_{i}"
        fb_repo.create(
            CanonicalFeedbackInput(
                feedback_id=fid,
                source="google_play",
                text="App crashes when pressing checkout button",
                created_at=now,
            )
        )
        fb_repo.save_analysis(
            feedback_id=fid,
            sentiment="negative",
            sentiment_confidence=0.92,
            intent="bug",
            intent_confidence=0.95,
            cleaned_text="app crashes when pressing checkout button",
        )
        prob_repo.link_feedback(problem.id, fid)

    llm_service = LLMInsightService(db_session)
    # Ensure client is forced to fallback mode
    llm_service.client.api_key = None
    insight = llm_service.generate_insight_for_problem(problem.id)

    assert insight.id is not None
    assert len(insight.summary) > 20
    assert "Crash" in insight.summary or "Checkout" in insight.summary
    assert len(insight.recommended_actions) >= 2
    assert insight.suggested_response is not None
