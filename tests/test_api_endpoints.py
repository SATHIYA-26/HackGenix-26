import uuid
import pytest
from unittest.mock import patch, MagicMock
from backend.app.core.exceptions import (
    ConfigurationError,
    YouTubeCommentsDisabledError,
    YouTubeInvalidKeyError,
    YouTubeQuotaExceededError,
    YouTubeVideoNotFoundError,
)


def test_create_and_get_business(client):
    # 1. Create Business
    payload = {"name": "Stripe Analytics"}
    response = client.post("/api/v1/businesses", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "Stripe Analytics"
    assert "id" in data
    business_id = data["id"]

    # 2. Get Business by ID
    get_res = client.get(f"/api/v1/businesses/{business_id}")
    assert get_res.status_code == 200
    assert get_res.json()["id"] == business_id
    assert get_res.json()["name"] == "Stripe Analytics"

    # 3. List Businesses
    list_res = client.get("/api/v1/businesses")
    assert list_res.status_code == 200
    assert len(list_res.json()) >= 1


def test_sync_youtube_comments_endpoint_success(
    client,
    sample_business,
    youtube_comment_threads_page1,
    youtube_video_details_response,
):
    with patch("backend.app.services.youtube.YouTubeApiClient") as MockClientClass:
        mock_client_instance = MockClientClass.return_value
        mock_client_instance.get_video_details.return_value = youtube_video_details_response["items"][0]
        mock_client_instance.get_comment_threads.return_value = {
            "items": [youtube_comment_threads_page1["items"][0]],
            "nextPageToken": None,
        }
        mock_client_instance.get_comment_replies.return_value = {"items": []}

        payload = {
            "business_id": str(sample_business.id),
        }
        response = client.post("/api/v1/youtube/videos/vid123/sync", json=payload)
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "success"
        assert data["video_id"] == "vid123"
        assert data["comments_fetched"] == 2
        assert data["comments_inserted"] == 2
        assert data["duplicates"] == 0


def test_sync_youtube_comments_comments_disabled(client, sample_business):
    with patch(
        "backend.app.services.youtube.YouTubeApiClient.get_comment_threads",
        side_effect=YouTubeCommentsDisabledError("Comments disabled for this video"),
    ):
        with patch(
            "backend.app.services.youtube.YouTubeApiClient.get_video_details",
            return_value=None,
        ):
            payload = {"business_id": str(sample_business.id)}
            response = client.post("/api/v1/youtube/videos/disabled_vid/sync", json=payload)
            assert response.status_code == 403
            assert response.json()["detail"]["error"] == "CommentsDisabled"


def test_sync_youtube_comments_quota_exceeded(client, sample_business):
    with patch(
        "backend.app.services.youtube.YouTubeApiClient.get_comment_threads",
        side_effect=YouTubeQuotaExceededError("Quota reached for today"),
    ):
        with patch(
            "backend.app.services.youtube.YouTubeApiClient.get_video_details",
            return_value=None,
        ):
            payload = {"business_id": str(sample_business.id)}
            response = client.post("/api/v1/youtube/videos/quota_vid/sync", json=payload)
            assert response.status_code == 429
            assert response.json()["detail"]["error"] == "QuotaExceeded"


def test_sync_youtube_comments_invalid_api_key(client, sample_business):
    with patch(
        "backend.app.services.youtube.YouTubeApiClient.get_comment_threads",
        side_effect=YouTubeInvalidKeyError("API key invalid"),
    ):
        with patch(
            "backend.app.services.youtube.YouTubeApiClient.get_video_details",
            return_value=None,
        ):
            payload = {"business_id": str(sample_business.id)}
            response = client.post("/api/v1/youtube/videos/any_vid/sync", json=payload)
            assert response.status_code == 401
            assert response.json()["detail"]["error"] == "InvalidYouTubeApiKey"


def test_sync_youtube_comments_missing_config(client, sample_business):
    with patch(
        "backend.app.services.youtube.YouTubeApiClient.get_comment_threads",
        side_effect=ConfigurationError("YOUTUBE_API_KEY is not configured"),
    ):
        with patch(
            "backend.app.services.youtube.YouTubeApiClient.get_video_details",
            return_value=None,
        ):
            payload = {"business_id": str(sample_business.id)}
            response = client.post("/api/v1/youtube/videos/any_vid/sync", json=payload)
            assert response.status_code == 500
            assert response.json()["detail"]["error"] == "ConfigurationError"


def test_get_business_comments_endpoint(
    client,
    sample_business,
    youtube_comment_threads_page1,
    youtube_video_details_response,
):
    # 1. Sync comments first
    with patch("backend.app.services.youtube.YouTubeApiClient") as MockClientClass:
        mock_client = MockClientClass.return_value
        mock_client.get_video_details.return_value = youtube_video_details_response["items"][0]
        mock_client.get_comment_threads.return_value = {
            "items": [youtube_comment_threads_page1["items"][0]],
            "nextPageToken": None,
        }
        mock_client.get_comment_replies.return_value = {"items": []}

        client.post(
            "/api/v1/youtube/videos/vid123/sync",
            json={"business_id": str(sample_business.id)},
        )

    # 2. Retrieve comments via endpoint
    response = client.get(f"/api/v1/businesses/{sample_business.id}/youtube-comments?page=1&page_size=10")
    assert response.status_code == 200
    data = response.json()
    assert data["total"] == 2
    assert data["page"] == 1
    assert len(data["items"]) == 2
    assert data["items"][0]["source"] == "youtube"
