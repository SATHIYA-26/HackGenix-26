from datetime import datetime, timezone


def test_intelligence_and_dashboard_api(client):
    now = datetime.now(timezone.utc).isoformat()

    # Ingest diverse batch of feedback
    feedbacks = [
        {"feedback_id": "dash_001", "source": "youtube", "text": "UPI payment failed completely on checkout", "created_at": now},
        {"feedback_id": "dash_002", "source": "youtube", "text": "Payment through UPI is not working", "created_at": now},
        {"feedback_id": "dash_003", "source": "google_play", "text": "Money debited but order cancelled", "created_at": now},
        {"feedback_id": "dash_004", "source": "app_store", "text": "Delivery was delayed by four days", "created_at": now},
        {"feedback_id": "dash_005", "source": "survey", "text": "Loved the clean UI update and fast checkout ❤️", "created_at": now},
    ]
    client.post("/api/v1/feedback/batch", json={"items": feedbacks})

    # Run analysis to form clusters
    client.post("/api/v1/analysis/run", json={"batch_size": 20, "reprocess_all": True, "run_clustering": True})

    # Test GET /api/v1/problems
    problems_res = client.get("/api/v1/problems")
    assert problems_res.status_code == 200
    problems = problems_res.json()
    assert isinstance(problems, list)

    if len(problems) > 0:
        first_prob_id = problems[0]["id"]

        # Test GET /api/v1/problems/{problem_id}
        prob_detail = client.get(f"/api/v1/problems/{first_prob_id}")
        assert prob_detail.status_code == 200
        detail_data = prob_detail.json()
        assert detail_data["id"] == first_prob_id
        assert "priority_breakdown" in detail_data
        assert "representative_feedback" in detail_data

    # Test GET /api/v1/trends
    trends_res = client.get("/api/v1/trends")
    assert trends_res.status_code == 200
    assert isinstance(trends_res.json(), list)

    # Test GET /api/v1/recommendations
    recs_res = client.get("/api/v1/recommendations")
    assert recs_res.status_code == 200
    assert isinstance(recs_res.json(), list)

    # Test GET /api/v1/dashboard/summary
    dash_res = client.get("/api/v1/dashboard/summary")
    assert dash_res.status_code == 200
    dash_data = dash_res.json()
    assert dash_data["total_feedback"] >= 5
    assert dash_data["analyzed_feedback"] >= 5
    assert "sentiment_distribution" in dash_data
    assert "intent_distribution" in dash_data
    assert "source_distribution" in dash_data
    assert "top_priority_problems" in dash_data
