import logging
from fastapi import APIRouter, Depends, HTTPException, status

from backend.app.api.deps import get_youtube_sync_service
from backend.app.core.exceptions import (
    AppException,
    ConfigurationError,
    EntityNotFoundError,
    YouTubeApiError,
    YouTubeCommentsDisabledError,
    YouTubeInvalidKeyError,
    YouTubeNetworkError,
    YouTubeQuotaExceededError,
    YouTubeRateLimitError,
    YouTubeTimeoutError,
    YouTubeVideoNotFoundError,
)
from backend.app.schemas.youtube import YouTubeSyncRequest, YouTubeSyncResponse
from backend.app.services.youtube import YouTubeSyncService

logger = logging.getLogger(__name__)

router = APIRouter()


@router.post(
    "/videos/{video_id}/sync",
    response_model=YouTubeSyncResponse,
    status_code=status.HTTP_200_OK,
    summary="Synchronize comments for a YouTube video",
    description=(
        "Fetches real public top-level comments and replies for the given video ID "
        "using YouTube Data API v3, normalizes them, and persists new comments into the database."
    ),
)
def sync_youtube_video_comments(
    video_id: str,
    payload: YouTubeSyncRequest,
    youtube_service: YouTubeSyncService = Depends(get_youtube_sync_service),
):
    """
    Triggers idempotent comments synchronization for a specific YouTube video.
    """
    clean_video_id = video_id.strip()
    if not clean_video_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A valid YouTube video ID must be provided.",
        )

    try:
        result = youtube_service.sync_video_comments(
            business_id=payload.business_id,
            video_id=clean_video_id,
            max_comments=payload.max_comments,
        )
        return result
    except EntityNotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=exc.message)
    except ConfigurationError as exc:
        logger.error("Configuration error during YouTube sync: %s", exc.message)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={"error": "ConfigurationError", "message": exc.message},
        )
    except YouTubeInvalidKeyError as exc:
        logger.error("YouTube API Key error: %s", exc.message)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={"error": "InvalidYouTubeApiKey", "message": exc.message},
        )
    except YouTubeCommentsDisabledError as exc:
        logger.warning("YouTube comments disabled for video %s: %s", clean_video_id, exc.message)
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={"error": "CommentsDisabled", "message": exc.message},
        )
    except YouTubeQuotaExceededError as exc:
        logger.error("YouTube API quota exceeded: %s", exc.message)
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail={"error": "QuotaExceeded", "message": exc.message},
        )
    except YouTubeRateLimitError as exc:
        logger.warning("YouTube API rate limited: %s", exc.message)
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail={"error": "RateLimitExceeded", "message": exc.message},
        )
    except YouTubeVideoNotFoundError as exc:
        logger.warning("YouTube video not found: %s", clean_video_id)
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"error": "VideoNotFound", "message": exc.message},
        )
    except YouTubeTimeoutError as exc:
        logger.error("YouTube API timeout: %s", exc.message)
        raise HTTPException(
            status_code=status.HTTP_504_GATEWAY_TIMEOUT,
            detail={"error": "YouTubeTimeout", "message": exc.message},
        )
    except YouTubeNetworkError as exc:
        logger.error("YouTube network error: %s", exc.message)
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail={"error": "YouTubeNetworkError", "message": exc.message},
        )
    except YouTubeApiError as exc:
        logger.error("YouTube API error: %s", exc.message)
        raise HTTPException(
            status_code=exc.status_code if 400 <= exc.status_code <= 599 else 502,
            detail={"error": "YouTubeApiError", "message": exc.message},
        )
    except AppException as exc:
        raise HTTPException(status_code=exc.status_code, detail=exc.message)
    except Exception as exc:
        logger.exception("Unexpected error during YouTube sync: %s", str(exc))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={"error": "InternalServerError", "message": "An unexpected error occurred during sync."},
        )
