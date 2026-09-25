from typing import Optional
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    PROJECT_NAME: str = "Feedback Intelligence"
    API_V1_STR: str = "/api/v1"
    ENVIRONMENT: str = "development"
    
    # Database
    DATABASE_URL: str = "postgresql://postgres:postgres@localhost:5432/feedback_intelligence"
    
    # YouTube Data API v3
    YOUTUBE_API_KEY: Optional[str] = None
    
    # YouTube Sync defaults
    YOUTUBE_MAX_RESULTS_PER_PAGE: int = 100
    YOUTUBE_API_TIMEOUT_SECONDS: float = 15.0

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore",
    )


settings = Settings()
