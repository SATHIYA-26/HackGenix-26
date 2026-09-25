import httpx
import pytest
from unittest.mock import patch, MagicMock

from backend.app.core.exceptions import (
    ConfigurationError,
    YouTubeApiError,
    YouTubeCommentsDisabledError,
    YouTubeInvalidKeyError,
    YouTubeQuotaExceededError,
    YouTubeRateLimitError,
    YouTubeTimeoutError,
    YouTubeVideoNotFoundError,
)
from backend.app.integrations.youtube_api import YouTubeApiClient


def test_client_missing_api_key_raises_configuration_error():
    client = YouTubeApiClient(api_key=None)
    with patch("backend.app.integrations.youtube_api.settings.YOUTUBE_API_KEY", None):
        with pytest.raises(ConfigurationError) as exc_info:
            client.get_comment_threads(video_id="test_vid")
        assert "YOUTUBE_API_KEY is not configured" in str(exc_info.value.message)


def test_client_placeholder_api_key_raises_configuration_error():
    client = YouTubeApiClient(api_key="your_youtube_api_key_here")
    with pytest.raises(ConfigurationError) as exc_info:
        client.get_comment_threads(video_id="test_vid")
    assert "placeholder" in str(exc_info.value.message)


def test_client_handles_comments_disabled_error():
    client = YouTubeApiClient(api_key="valid_key_123")
    mock_response = httpx.Response(
        status_code=403,
        json={
            "error": {
                "errors": [{"reason": "commentsDisabled", "message": "The video has disabled comments."}],
                "code": 403,
                "message": "The video has disabled comments.",
            }
        },
        request=httpx.Request("GET", "https://example.com"),
    )

    with patch("httpx.Client.get", return_value=mock_response):
        with pytest.raises(YouTubeCommentsDisabledError) as exc_info:
            client.get_comment_threads(video_id="vid_disabled")
        assert "Comments are disabled" in str(exc_info.value.message)


def test_client_handles_quota_exceeded_error():
    client = YouTubeApiClient(api_key="valid_key_123")
    mock_response = httpx.Response(
        status_code=403,
        json={
            "error": {
                "errors": [{"reason": "quotaExceeded", "message": "The request cannot be completed because quota is exceeded."}],
                "code": 403,
                "message": "The request cannot be completed because quota is exceeded.",
            }
        },
        request=httpx.Request("GET", "https://example.com"),
    )

    with patch("httpx.Client.get", return_value=mock_response):
        with pytest.raises(YouTubeQuotaExceededError) as exc_info:
            client.get_comment_threads(video_id="vid_123")
        assert "quota exceeded" in str(exc_info.value.message).lower()


def test_client_handles_invalid_api_key_error():
    client = YouTubeApiClient(api_key="invalid_key")
    mock_response = httpx.Response(
        status_code=400,
        json={
            "error": {
                "errors": [{"reason": "keyInvalid", "message": "API key not valid."}],
                "code": 400,
                "message": "API key not valid. Please pass a valid API key.",
            }
        },
        request=httpx.Request("GET", "https://example.com"),
    )

    with patch("httpx.Client.get", return_value=mock_response):
        with pytest.raises(YouTubeInvalidKeyError) as exc_info:
            client.get_comment_threads(video_id="vid_123")
        assert "Invalid YouTube API key" in str(exc_info.value.message)


def test_client_handles_video_not_found_error():
    client = YouTubeApiClient(api_key="valid_key_123")
    mock_response = httpx.Response(
        status_code=404,
        json={
            "error": {
                "errors": [{"reason": "videoNotFound", "message": "Video not found"}],
                "code": 404,
                "message": "Video not found",
            }
        },
        request=httpx.Request("GET", "https://example.com"),
    )

    with patch("httpx.Client.get", return_value=mock_response):
        with pytest.raises(YouTubeVideoNotFoundError) as exc_info:
            client.get_comment_threads(video_id="non_existing_vid")
        assert "not found" in str(exc_info.value.message).lower()


def test_client_handles_timeout_error():
    client = YouTubeApiClient(api_key="valid_key_123")

    with patch("httpx.Client.get", side_effect=httpx.ConnectTimeout("Connection timed out")):
        with pytest.raises(YouTubeTimeoutError):
            client.get_comment_threads(video_id="vid_123")
