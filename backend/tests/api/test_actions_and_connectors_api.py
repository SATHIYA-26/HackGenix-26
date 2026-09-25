import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.db.models import ProblemCluster, Recommendation


def test_connector_ingest_apis(client: TestClient):
    # 1. Test listing connectors
    res = client.get("/api/v1/connectors")
    assert res.status_code == 200
    connectors = res.json()
    source_names = [c["source"] for c in connectors]
    assert "youtube" in source_names
    assert "google_play" in source_names
    assert "app_store" in source_names
    assert "zendesk" in source_names

    # 2. Ingest through YouTube connector endpoint
    yt_payload = {
        "id": "yt_comment_123",
        "text": "Great tutorial but app crashes at 5:30 on login.",
        "videoId": "xyz999",
        "author": "UserABC",
    }
    yt_res = client.post("/api/v1/connectors/youtube/ingest", json=yt_payload)
    assert yt_res.status_code == 201
    yt_data = yt_res.json()
    assert yt_data["source"] == "youtube"
    assert yt_data["feedback_id"] == "yt_comment_123"

    # 3. Ingest through Google Play connector endpoint
    gp_payload = {
        "reviewId": "gp_review_777",
        "comments": [
            {
                "userComment": {
                    "text": "Payment failed during UPI checkout.",
                    "starRating": 1,
                    "appVersionName": "v4.2.1",
                }
            }
        ]
    }
    gp_res = client.post("/api/v1/connectors/google_play/ingest", json=gp_payload)
    assert gp_res.status_code == 201
    gp_data = gp_res.json()
    assert gp_data["source"] == "google_play"
    assert gp_data["rating"] == 1.0


def test_actions_api_closed_loop(client: TestClient, db_session: Session):
    # Create dummy Problem Cluster & Recommendation in test session
    problem = ProblemCluster(
        name="Cart Failure on Checkout",
        description="Cart crashes when clearing items",
        feedback_count=5,
        priority_score=0.85,
    )
    db_session.add(problem)
    db_session.commit()
    db_session.refresh(problem)

    rec = Recommendation(
        problem_id=problem.id,
        recommendation="Fix cart state mutation in CartService.",
        reason="Race condition between clear and sync.",
        evidence={"observed": "5 complaints"},
    )
    db_session.add(rec)
    db_session.commit()
    db_session.refresh(rec)

    # 1. Create action from recommendation
    create_res = client.post(
        f"/api/v1/actions/from-recommendation/{rec.id}?title=Fix+cart+mutation+race+condition&assignee=TeamCart&target_version=v2.1.0"
    )
    assert create_res.status_code == 201
    action_data = create_res.json()
    action_id = action_data["action_id"]
    assert action_data["status"] == "planned"
    assert action_data["problem_id"] == problem.id

    # 2. Start implementation
    start_res = client.post(f"/api/v1/actions/{action_id}/start?jira_key=ENG-888")
    assert start_res.status_code == 200
    assert start_res.json()["status"] == "in_progress"
    assert start_res.json()["jira_issue_key"] == "ENG-888"

    # 3. Release action
    rel_res = client.post(
        f"/api/v1/actions/{action_id}/release",
        json={"release_version": "v2.1.0", "notes": "Merged PR #456"},
    )
    assert rel_res.status_code == 200
    assert rel_res.json()["status"] == "released"
    assert rel_res.json()["release_version"] == "v2.1.0"

    # 4. Measure impact
    measure_res = client.post(f"/api/v1/actions/{action_id}/measure")
    assert measure_res.status_code == 200
    impact_data = measure_res.json()
    assert impact_data["action_id"] == action_id
    assert "summary" in impact_data
    assert "impact_score" in impact_data

    # 5. List actions
    list_res = client.get("/api/v1/actions")
    assert list_res.status_code == 200
    assert list_res.json()["total"] >= 1
