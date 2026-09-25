from datetime import datetime, timezone
import pytest
from pydantic import ValidationError

from app.schemas.feedback import CanonicalFeedbackInput, FeedbackBatchInput
from app.db.models import Feedback, FeedbackAnalysis, ProblemCluster
from app.db.repositories.feedback_repository import FeedbackRepository
from app.db.repositories.problem_repository import ProblemRepository


def test_canonical_feedback_valid():
    payload = {
        "feedback_id": "yt_101",
        "source": "youtube",
        "source_url": "https://youtube.com/watch?v=123",
        "text": "UPI payment failed while ordering groceries",
        "rating": 1.0,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "metadata": {"platform": "android", "version": "4.2.1"},
    }
    schema = CanonicalFeedbackInput(**payload)
    assert schema.feedback_id == "yt_101"
    assert schema.source == "youtube"
    assert schema.rating == 1.0
    assert schema.metadata["platform"] == "android"


def test_canonical_feedback_empty_text_fails():
    with pytest.raises(ValidationError):
        CanonicalFeedbackInput(
            feedback_id="yt_102",
            source="youtube",
            text="   ",
            created_at=datetime.now(timezone.utc),
        )


def test_canonical_feedback_rating_bounds():
    with pytest.raises(ValidationError):
        CanonicalFeedbackInput(
            feedback_id="yt_103",
            source="youtube",
            text="Valid text",
            rating=6.0,  # Invalid: > 5.0
            created_at=datetime.now(timezone.utc),
        )

    with pytest.raises(ValidationError):
        CanonicalFeedbackInput(
            feedback_id="yt_104",
            source="youtube",
            text="Valid text",
            rating=0.5,  # Invalid: < 1.0
            created_at=datetime.now(timezone.utc),
        )


def test_feedback_repository_crud(db_session):
    repo = FeedbackRepository(db_session)
    now = datetime.now(timezone.utc)

    input_data = CanonicalFeedbackInput(
        feedback_id="test_repo_1",
        source="google_play",
        source_url="https://play.google.com/review/1",
        text="App crashes when opening search tab",
        rating=1.0,
        created_at=now,
        metadata={"platform": "android"},
    )

    created = repo.create(input_data)
    assert created.id is not None
    assert created.feedback_id == "test_repo_1"

    # Fetch by feedback_id
    fetched = repo.get_by_feedback_id("test_repo_1")
    assert fetched is not None
    assert fetched.text == "App crashes when opening search tab"

    # Save analysis
    analysis = repo.save_analysis(
        feedback_id="test_repo_1",
        sentiment="negative",
        sentiment_confidence=0.95,
        intent="bug",
        intent_confidence=0.92,
        cleaned_text="app crashes when opening search tab",
    )
    assert analysis.id is not None
    assert analysis.sentiment == "negative"

    # Verify counts
    assert repo.count() >= 1
    assert repo.count_analyzed() >= 1


def test_problem_repository_crud(db_session):
    repo = ProblemRepository(db_session)

    problem = repo.create_or_update(
        name="UPI Payment Failure",
        description="Customers reporting transaction timeout and deduction without order",
        feedback_count=50,
        average_sentiment=-0.85,
        growth_rate=0.75,
        severity=0.90,
        user_impact=0.85,
        priority_score=0.88,
        frequency_score=0.80,
        severity_score=0.90,
        growth_score=0.75,
        user_impact_score=0.85,
        negative_sentiment_score=0.95,
        product_dimension={"platform": "android", "feature": "checkout"},
    )

    assert problem.id is not None
    assert problem.name == "UPI Payment Failure"
    assert problem.priority_score == 0.88

    fetched = repo.get_by_id(problem.id)
    assert fetched is not None
    assert fetched.name == "UPI Payment Failure"
