from datetime import datetime, timezone


def test_health_check(client):
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "Feedback Intelligence Platform" in data["service"]


def test_ready_check(client):
    response = client.get("/ready")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ready"
    assert data["database"] == "connected"


def test_ingest_single_feedback(client):
    payload = {
        "feedback_id": "api_test_001",
        "source": "youtube",
        "source_url": "https://youtube.com/watch?v=api_test",
        "text": "UPI payment failed and order got cancelled",
        "rating": 1.0,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "metadata": {"platform": "android", "version": "4.2.1"},
    }
    response = client.post("/api/v1/feedback", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["feedback_id"] == "api_test_001"
    assert data["source"] == "youtube"
    assert data["text"] == "UPI payment failed and order got cancelled"
    assert data["metadata"]["platform"] == "android"


def test_ingest_duplicate_feedback(client):
    payload = {
        "feedback_id": "api_test_dup",
        "source": "google_play",
        "text": "First submission text",
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    res1 = client.post("/api/v1/feedback", json=payload)
    assert res1.status_code == 201

    # Ingest same feedback_id again: should be idempotent and return existing entity
    res2 = client.post("/api/v1/feedback", json=payload)
    assert res2.status_code == 201
    assert res2.json()["feedback_id"] == "api_test_dup"


def test_ingest_batch_feedback(client):
    now = datetime.now(timezone.utc).isoformat()
    payload = {
        "items": [
            {
                "feedback_id": "batch_001",
                "source": "app_store",
                "text": "Great checkout speed!",
                "rating": 5.0,
                "created_at": now,
            },
            {
                "feedback_id": "batch_002",
                "source": "support_ticket",
                "text": "Delivery was delayed by 3 days",
                "rating": 2.0,
                "created_at": now,
            },
        ]
    }
    response = client.post("/api/v1/feedback/batch", json=payload)
    assert response.status_code == 201
    items = response.json()
    assert len(items) == 2
    assert items[0]["feedback_id"] == "batch_001"
    assert items[1]["feedback_id"] == "batch_002"


def test_list_and_get_feedback(client):
    now = datetime.now(timezone.utc).isoformat()
    client.post(
        "/api/v1/feedback",
        json={
            "feedback_id": "list_test_01",
            "source": "survey",
            "text": "Survey feedback text for retrieval testing",
            "created_at": now,
        },
    )

    # List endpoint
    list_res = client.get("/api/v1/feedback?source=survey")
    assert list_res.status_code == 200
    data = list_res.json()
    assert data["total"] >= 1
    assert any(item["feedback_id"] == "list_test_01" for item in data["items"])

    # Get single endpoint
    get_res = client.get("/api/v1/feedback/list_test_01")
    assert get_res.status_code == 200
    assert get_res.json()["feedback_id"] == "list_test_01"


def test_get_nonexistent_feedback_returns_404(client):
    response = client.get("/api/v1/feedback/non_existent_id_9999")
    assert response.status_code == 404
    data = response.json()
    assert "detail" in data or "message" in data


def test_invalid_feedback_validation_returns_422(client):
    # Empty text
    response = client.post(
        "/api/v1/feedback",
        json={
            "feedback_id": "invalid_01",
            "source": "youtube",
            "text": "   ",
            "created_at": datetime.now(timezone.utc).isoformat(),
        },
    )
    assert response.status_code == 422
