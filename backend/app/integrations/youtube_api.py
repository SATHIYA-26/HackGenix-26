import logging
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional, Tuple
import httpx

from backend.app.core.config import settings
from backend.app.core.exceptions import (
    ConfigurationError,
    YouTubeApiError,
    YouTubeCommentsDisabledError,
    YouTubeInvalidKeyError,
    YouTubeNetworkError,
    YouTubeQuotaExceededError,
    YouTubeRateLimitError,
    YouTubeTimeoutError,
    YouTubeVideoNotFoundError,
)

logger = logging.getLogger(__name__)

YOUTUBE_API_BASE_URL = "https://www.googleapis.com/youtube/v3"


def parse_iso_datetime(dt_str: Optional[str]) -> datetime:
    """Parse ISO 8601 string from YouTube API into timezone-aware datetime."""
    if not dt_str:
        return datetime.now(timezone.utc)
    try:
        # YouTube returns format like 2024-01-15T10:00:00Z
        if dt_str.endswith("Z"):
            dt_str = dt_str[:-1] + "+00:00"
        return datetime.fromisoformat(dt_str)
    except Exception:
        return datetime.now(timezone.utc)


def parse_comment_snippet(
    comment_data: Dict[str, Any],
    video_id: str,
    parent_id: Optional[str] = None,
) -> Dict[str, Any]:
    """
    Normalizes a single YouTube comment JSON object (from topLevelComment or replies)
    into standard normalized feedback payload.
    """
    snippet = comment_data.get("snippet", {})
    comment_id = comment_data.get("id", "")
    author_channel_id = (
        snippet.get("authorChannelId", {}).get("value")
        if isinstance(snippet.get("authorChannelId"), dict)
        else None
    )

    published_at = parse_iso_datetime(snippet.get("publishedAt"))
    updated_at = parse_iso_datetime(snippet.get("updatedAt")) if snippet.get("updatedAt") else None

    # Text content: prefer textOriginal for unescaped plain text, fallback to textDisplay
    text_content = snippet.get("textOriginal") or snippet.get("textDisplay") or ""

    return {
        "source": "youtube",
        "source_type": "comment",
        "external_id": str(comment_id),
        "parent_external_id": str(parent_id) if parent_id else snippet.get("parentId"),
        "author_name": snippet.get("authorDisplayName"),
        "author_url": snippet.get("authorChannelUrl"),
        "text": text_content,
        "rating": None,
        "rating_scale": None,
        "created_at": published_at,
        "updated_at": updated_at,
        "source_url": f"https://www.youtube.com/watch?v={video_id}&lc={comment_id}" if video_id else None,
        "metadata": {
            "video_id": video_id,
            "like_count": snippet.get("likeCount", 0),
            "author_channel_id": author_channel_id,
            "author_profile_image_url": snippet.get("authorProfileImageUrl"),
            "can_rate": snippet.get("canRate", False),
            "viewer_rating": snippet.get("viewerRating", "none"),
            "is_reply": bool(parent_id or snippet.get("parentId")),
        },
    }


def parse_comment_thread(
    thread_item: Dict[str, Any],
    video_id: str,
) -> Tuple[Dict[str, Any], List[Dict[str, Any]], int]:
    """
    Parses a YouTube commentThread resource item.
    Returns:
      (top_level_comment_dict, embedded_replies_list, total_reply_count)
    """
    thread_snippet = thread_item.get("snippet", {})
    actual_video_id = thread_snippet.get("videoId") or video_id
    total_reply_count = thread_snippet.get("totalReplyCount", 0)

    top_comment_obj = thread_snippet.get("topLevelComment", {})
    top_comment = parse_comment_snippet(top_comment_obj, video_id=actual_video_id, parent_id=None)
    top_comment["metadata"]["total_reply_count"] = total_reply_count
    top_comment["metadata"]["can_reply"] = thread_snippet.get("canReply", True)
    top_comment["metadata"]["is_public"] = thread_snippet.get("isPublic", True)

    replies: List[Dict[str, Any]] = []
    replies_obj = thread_item.get("replies", {})
    embedded_replies = replies_obj.get("comments", [])
    top_comment_id = top_comment["external_id"]

    for reply_item in embedded_replies:
        reply_dict = parse_comment_snippet(
            reply_item, video_id=actual_video_id, parent_id=top_comment_id
        )
        replies.append(reply_dict)

    return top_comment, replies, total_reply_count


class YouTubeApiClient:
    """
    Client for interacting with the official YouTube Data API v3.
    Communicates directly via HTTPX without third-party SDK bloat or scraping.
    """

    def __init__(
        self,
        api_key: Optional[str] = None,
        timeout: float = settings.YOUTUBE_API_TIMEOUT_SECONDS,
    ):
        self.api_key = api_key or settings.YOUTUBE_API_KEY
        self.timeout = timeout

    def _check_api_key(self) -> str:
        if not self.api_key or self.api_key.strip() == "" or "your_youtube_api_key" in self.api_key:
            raise ConfigurationError(
                "YOUTUBE_API_KEY is not configured or is using placeholder. "
                "Please set a valid YOUTUBE_API_KEY in your environment or .env file."
            )
        return self.api_key.strip()

    def _handle_response_errors(self, response: httpx.Response) -> None:
        """Parses error responses from YouTube Data API v3 and raises domain exceptions."""
        if response.is_success:
            return

        status_code = response.status_code
        try:
            error_data = response.json().get("error", {})
        except Exception:
            error_data = {"message": response.text, "errors": []}

        error_message = error_data.get("message", f"YouTube API error: HTTP {status_code}")
        errors_list = error_data.get("errors", [])
        reason = errors_list[0].get("reason", "") if errors_list else ""

        logger.error(
            "YouTube API error response [status=%d]: reason='%s', message='%s'",
            status_code,
            reason,
            error_message,
        )

        if status_code == 400:
            if reason in ["keyInvalid", "badRequest"] or "API key not valid" in error_message:
                raise YouTubeInvalidKeyError(
                    f"Invalid YouTube API key: {error_message}", error_details=error_data
                )
            raise YouTubeApiError(f"Bad request to YouTube API: {error_message}", status_code=400, error_details=error_data)

        if status_code == 401:
            raise YouTubeInvalidKeyError(
                f"Unauthorized YouTube API access: {error_message}", error_details=error_data
            )

        if status_code == 403:
            if reason == "commentsDisabled" or "disabled comments" in error_message.lower():
                raise YouTubeCommentsDisabledError(
                    f"Comments are disabled for this YouTube video: {error_message}", error_details=error_data
                )
            if reason in ["quotaExceeded", "dailyLimitExceeded"] or "quota" in error_message.lower():
                raise YouTubeQuotaExceededError(
                    f"YouTube API quota exceeded: {error_message}", error_details=error_data
                )
            if reason in ["userRateLimitExceeded", "rateLimitExceeded"]:
                raise YouTubeRateLimitError(
                    f"YouTube API rate limit reached: {error_message}", error_details=error_data
                )
            raise YouTubeApiError(
                f"YouTube API permission error: {error_message}", status_code=403, error_details=error_data
            )

        if status_code == 404:
            raise YouTubeVideoNotFoundError(
                f"YouTube resource not found: {error_message}", error_details=error_data
            )

        if status_code == 429:
            raise YouTubeRateLimitError(
                f"Too many requests to YouTube API: {error_message}", error_details=error_data
            )

        raise YouTubeApiError(
            f"YouTube API error ({status_code}): {error_message}",
            status_code=status_code,
            error_details=error_data,
        )

    def _execute_request(
        self,
        endpoint: str,
        params: Dict[str, Any],
    ) -> Dict[str, Any]:
        """Performs a synchronous HTTP GET request to YouTube Data API v3."""
        api_key = self._check_api_key()
        request_params = {**params, "key": api_key}
        url = f"{YOUTUBE_API_BASE_URL}/{endpoint}"

        try:
            with httpx.Client(timeout=self.timeout) as client:
                response = client.get(url, params=request_params)
                self._handle_response_errors(response)
                return response.json()
        except (YouTubeApiError, ConfigurationError):
            raise
        except httpx.TimeoutException as exc:
            logger.error("Timeout while calling YouTube API endpoint '%s': %s", endpoint, str(exc))
            raise YouTubeTimeoutError(f"Request to YouTube API timed out: {str(exc)}") from exc
        except httpx.RequestError as exc:
            logger.error("Network error while calling YouTube API endpoint '%s': %s", endpoint, str(exc))
            raise YouTubeNetworkError(f"Network error communicating with YouTube API: {str(exc)}") from exc
        except Exception as exc:
            logger.error("Unexpected error while calling YouTube API: %s", str(exc))
            raise YouTubeApiError(f"Unexpected error calling YouTube API: {str(exc)}") from exc

    async def _execute_request_async(
        self,
        endpoint: str,
        params: Dict[str, Any],
    ) -> Dict[str, Any]:
        """Performs an asynchronous HTTP GET request to YouTube Data API v3."""
        api_key = self._check_api_key()
        request_params = {**params, "key": api_key}
        url = f"{YOUTUBE_API_BASE_URL}/{endpoint}"

        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.get(url, params=request_params)
                self._handle_response_errors(response)
                return response.json()
        except (YouTubeApiError, ConfigurationError):
            raise
        except httpx.TimeoutException as exc:
            logger.error("Timeout while calling YouTube API async endpoint '%s': %s", endpoint, str(exc))
            raise YouTubeTimeoutError(f"Request to YouTube API timed out: {str(exc)}") from exc
        except httpx.RequestError as exc:
            logger.error("Network error while calling YouTube API async endpoint '%s': %s", endpoint, str(exc))
            raise YouTubeNetworkError(f"Network error communicating with YouTube API: {str(exc)}") from exc
        except Exception as exc:
            logger.error("Unexpected error while calling YouTube API async: %s", str(exc))
            raise YouTubeApiError(f"Unexpected error calling YouTube API: {str(exc)}") from exc

    def get_comment_threads(
        self,
        video_id: str,
        page_token: Optional[str] = None,
        max_results: int = 100,
    ) -> Dict[str, Any]:
        """
        Fetches comment threads for a specific YouTube video.
        Uses commentThreads.list with part=snippet,replies.
        """
        params: Dict[str, Any] = {
            "part": "snippet,replies",
            "videoId": video_id,
            "maxResults": min(max(max_results, 1), 100),
            "textFormat": "plainText",
        }
        if page_token:
            params["pageToken"] = page_token

        return self._execute_request("commentThreads", params)

    async def get_comment_threads_async(
        self,
        video_id: str,
        page_token: Optional[str] = None,
        max_results: int = 100,
    ) -> Dict[str, Any]:
        """Async version of get_comment_threads."""
        params: Dict[str, Any] = {
            "part": "snippet,replies",
            "videoId": video_id,
            "maxResults": min(max(max_results, 1), 100),
            "textFormat": "plainText",
        }
        if page_token:
            params["pageToken"] = page_token

        return await self._execute_request_async("commentThreads", params)

    def get_comment_replies(
        self,
        parent_id: str,
        page_token: Optional[str] = None,
        max_results: int = 100,
    ) -> Dict[str, Any]:
        """
        Fetches all replies for a parent comment thread using comments.list.
        """
        params: Dict[str, Any] = {
            "part": "snippet",
            "parentId": parent_id,
            "maxResults": min(max(max_results, 1), 100),
            "textFormat": "plainText",
        }
        if page_token:
            params["pageToken"] = page_token

        return self._execute_request("comments", params)

    async def get_comment_replies_async(
        self,
        parent_id: str,
        page_token: Optional[str] = None,
        max_results: int = 100,
    ) -> Dict[str, Any]:
        """Async version of get_comment_replies."""
        params: Dict[str, Any] = {
            "part": "snippet",
            "parentId": parent_id,
            "maxResults": min(max(max_results, 1), 100),
            "textFormat": "plainText",
        }
        if page_token:
            params["pageToken"] = page_token

        return await self._execute_request_async("comments", params)

    def get_video_details(self, video_id: str) -> Optional[Dict[str, Any]]:
        """
        Retrieves video metadata (title, channelId, channelTitle, publishedAt)
        using videos.list with part=snippet.
        """
        params = {
            "part": "snippet",
            "id": video_id,
        }
        try:
            data = self._execute_request("videos", params)
            items = data.get("items", [])
            if items:
                return items[0]
            return None
        except Exception as exc:
            logger.warning("Could not fetch video details for %s: %s", video_id, str(exc))
            return None

    async def get_video_details_async(self, video_id: str) -> Optional[Dict[str, Any]]:
        """Async version of get_video_details."""
        params = {
            "part": "snippet",
            "id": video_id,
        }
        try:
            data = await self._execute_request_async("videos", params)
            items = data.get("items", [])
            if items:
                return items[0]
            return None
        except Exception as exc:
            logger.warning("Could not fetch video details async for %s: %s", video_id, str(exc))
            return None
