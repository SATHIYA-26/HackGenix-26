from datetime import datetime, timezone, timedelta
import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.db.models import Base, Feedback, FeedbackAnalysis, ProblemCluster, Recommendation, Action
from app.actions.schemas import ActionCreate, ActionUpdate, ActionReleaseRequest, ActionStatus, ActionType
from app.actions.service import ActionService
from app.actions.repository import ActionRepository


@pytest.fixture
def db_session():
    engine = create_engine("sqlite:///:memory:", connect_args={"check_same_thread": False})
    Base.metadata.create_all(bind=engine)
    Session = sessionmaker(bind=engine)
    session = Session()
    yield session
    session.close()


def test_action_lifecycle_and_impact_measurement(db_session):
    # 1. Setup Problem Cluster with Baseline Feedback
    problem = ProblemCluster(
        name="UPI Checkout Timeout Regression",
        description="Customers reporting failed UPI payments on v4.2.1",
        feedback_count=10,
        average_sentiment=-0.75,
        growth_rate=1.80,
        severity=0.90,
        user_impact=0.85,
        priority_score=0.92,
        product_dimension={"platform": "Android", "version": "v4.2.1", "feature": "checkout"},
    )
    db_session.add(problem)
    db_session.commit()
    db_session.refresh(problem)

    # Add 10 pre-release negative feedback items
    base_time = datetime.now(timezone.utc) - timedelta(days=5)
    for i in range(10):
        fb = Feedback(
            feedback_id=f"pre_fb_{i}",
            source="google_play",
            text=f"UPI transaction timeout on checkout! #{i}",
            created_at=base_time + timedelta(hours=i),
            extra_metadata={"version": "v4.2.1", "platform": "Android"},
        )
        db_session.add(fb)
        db_session.flush()

        analysis = FeedbackAnalysis(
            feedback_id=fb.feedback_id,
            sentiment="negative",
            sentiment_confidence=0.90,
            intent="bug_report",
            intent_confidence=0.95,
            cleaned_text=fb.text,
        )
        db_session.add(analysis)
        problem.feedback_items.append(fb)

    # Add recommendation
    rec = Recommendation(
        problem_id=problem.id,
        recommendation="Deploy idempotent retry handler in checkout worker v4.2.2.",
        reason="UPI webhooks dropping before status resolution.",
        evidence={"observed": "10 UPI timeouts", "component": "checkout"},
        confidence=0.92,
    )
    db_session.add(rec)
    db_session.commit()

    service = ActionService(db_session)

    # 2. Closed-Loop Stage 1: Recommendation -> Action (Planned)
    action = service.create_from_recommendation(
        recommendation_id=rec.id,
        title="Implement UPI idempotent retry handler",
        assignee="Payment Team",
        target_version="v4.2.2",
    )
    assert action.status == ActionStatus.PLANNED.value
    assert action.baseline_metrics["feedback_count"] == 10
    assert action.baseline_metrics["negative_ratio"] == 1.0
    assert action.baseline_metrics["priority_score"] == 0.92

    # 3. Closed-Loop Stage 2: Implementation (In Progress)
    action = service.start_implementation(action.action_id, assignee="alice@company.com", jira_key="ENG-420")
    assert action.status == ActionStatus.IN_PROGRESS.value
    assert action.assignee == "alice@company.com"
    assert action.jira_issue_key == "ENG-420"

    # 4. Closed-Loop Stage 3: Release
    release_time = datetime.now(timezone.utc) - timedelta(days=1)
    action = service.release_action(
        action.action_id,
        ActionReleaseRequest(release_version="v4.2.2", release_date=release_time),
    )
    assert action.status == ActionStatus.RELEASED.value
    assert action.release_version == "v4.2.2"

    # 5. Closed-Loop Stage 4: New Feedback Ingested Post-Release
    # Add only 1 positive post-release feedback (complaints dropped by 90%)
    post_fb = Feedback(
        feedback_id="post_fb_1",
        source="google_play",
        text="UPI checkout works flawlessly now on v4.2.2! Fast and smooth.",
        created_at=datetime.now(timezone.utc),
        extra_metadata={"version": "v4.2.2", "platform": "Android"},
    )
    db_session.add(post_fb)
    db_session.flush()

    analysis_post = FeedbackAnalysis(
        feedback_id=post_fb.feedback_id,
        sentiment="positive",
        sentiment_confidence=0.88,
        intent="praise",
        intent_confidence=0.92,
        cleaned_text=post_fb.text,
    )
    db_session.add(analysis_post)
    problem.feedback_items.append(post_fb)
    problem.priority_score = 0.25  # Problem severity reduced
    db_session.commit()

    # 6. Closed-Loop Stage 5: Impact Measurement
    impact = service.measure_impact(action.action_id)

    assert impact.action_id == action.action_id
    assert impact.volume_reduction_pct == 90.0  # From 10 complaints down to 1
    assert impact.negative_sentiment_delta == 100.0  # From 100% negative down to 0%
    assert impact.impact_score > 0.50
    assert impact.is_successful is True
    assert impact.status == ActionStatus.RESOLVED
    assert "Complaint volume decreased" in impact.summary
