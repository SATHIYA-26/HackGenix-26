from datetime import datetime, timezone


def test_analysis_run_and_semantic_search_api(client):
    now = datetime.now(timezone.utc).isoformat()

    # Ingest multiple sample feedbacks
    feedbacks = [
        {"feedback_id": "an_001", "source": "youtube", "text": "UPI payment failed on checkout", "created_at": now},
        {"feedback_id": "an_002", "source": "youtube", "text": "Payment through UPI is not working", "created_at": now},
        {"feedback_id": "an_003", "source": "youtube", "text": "Money got deducted from bank but order cancelled", "created_at": now},
        {"feedback_id": "an_004", "source": "google_play", "text": "Delivery was delayed by four days", "created_at": now},
        {"feedback_id": "an_005", "source": "survey", "text": "nice", "created_at": now}, # Noise
    ]
    client.post("/api/v1/feedback/batch", json={"items": feedbacks})

    # Trigger analysis run endpoint
    run_res = client.post(
        "/api/v1/analysis/run",
        json={"batch_size": 10, "reprocess_all": True, "run_clustering": True},
    )
    assert run_res.status_code == 200
    data = run_res.json()
    assert data["status"] == "completed"
    assert data["processed_count"] >= 5

    # Check that feedback now has analysis attached
    fb_res = client.get("/api/v1/feedback/an_001")
    assert fb_res.status_code == 200
    fb_data = fb_res.json()
    assert fb_data["analysis"] is not None
    assert fb_data["analysis"]["sentiment"] == "negative"
    assert fb_data["analysis"]["intent"] == "payment_issue"

    # Check noise item
    noise_res = client.get("/api/v1/feedback/an_005")
    assert noise_res.json()["analysis"]["is_noise"] is True

    # Test Semantic Search endpoint
    search_res = client.get("/api/v1/analysis/search?query=UPI payment failed&top_k=3")
    assert search_res.status_code == 200
    search_data = search_res.json()
    assert len(search_data["results"]) >= 1
    top_result = search_data["results"][0]
    assert "feedback_id" in top_result
    assert "similarity_score" in top_result
    assert top_result["similarity_score"] >= 0.40
