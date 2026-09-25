class AppException(Exception):
    """Base exception for application errors."""
    def __init__(self, message: str, status_code: int = 400):
        super().__init__(message)
        self.message = message
        self.status_code = status_code


class ConfigurationError(AppException):
    """Raised when application configuration or credentials are missing."""
    def __init__(self, message: str = "Application configuration missing or invalid"):
        super().__init__(message, status_code=500)


class EntityNotFoundError(AppException):
    """Raised when a database entity is not found."""
    def __init__(self, message: str = "Resource not found"):
        super().__init__(message, status_code=404)


class DuplicateEntityError(AppException):
    """Raised when an entity with unique fields already exists."""
    def __init__(self, message: str = "Resource already exists"):
        super().__init__(message, status_code=409)


# YouTube Integration Exceptions
class YouTubeApiError(AppException):
    """Base exception for YouTube API integration failures."""
    def __init__(self, message: str, status_code: int = 502, error_details: dict | None = None):
        super().__init__(message, status_code=status_code)
        self.error_details = error_details or {}


class YouTubeInvalidKeyError(YouTubeApiError):
    """Raised when the YouTube API Key is invalid or rejected."""
    def __init__(self, message: str = "Invalid YouTube API Key provided", error_details: dict | None = None):
        super().__init__(message, status_code=401, error_details=error_details)


class YouTubeVideoNotFoundError(YouTubeApiError):
    """Raised when the requested YouTube video is not found or is private."""
    def __init__(self, message: str = "YouTube video not found or is private", error_details: dict | None = None):
        super().__init__(message, status_code=404, error_details=error_details)


class YouTubeCommentsDisabledError(YouTubeApiError):
    """Raised when comments are disabled for the specified YouTube video."""
    def __init__(self, message: str = "Comments are disabled for this YouTube video", error_details: dict | None = None):
        super().__init__(message, status_code=403, error_details=error_details)


class YouTubeQuotaExceededError(YouTubeApiError):
    """Raised when the YouTube Data API v3 quota has been exceeded."""
    def __init__(self, message: str = "YouTube API quota exceeded for today", error_details: dict | None = None):
        super().__init__(message, status_code=429, error_details=error_details)


class YouTubeRateLimitError(YouTubeApiError):
    """Raised when rate limits are encountered."""
    def __init__(self, message: str = "YouTube API rate limit reached, please retry later", error_details: dict | None = None):
        super().__init__(message, status_code=429, error_details=error_details)


class YouTubeTimeoutError(YouTubeApiError):
    """Raised when a request to the YouTube API times out."""
    def __init__(self, message: str = "YouTube API request timed out", error_details: dict | None = None):
        super().__init__(message, status_code=504, error_details=error_details)


class YouTubeNetworkError(YouTubeApiError):
    """Raised when network connection fails."""
    def __init__(self, message: str = "Failed to connect to YouTube API", error_details: dict | None = None):
        super().__init__(message, status_code=502, error_details=error_details)
