from functools import lru_cache
from typing import Optional
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field, field_validator


class Settings(BaseSettings):
    """Application configuration loaded from environment variables and .env file."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

    # General
    PROJECT_NAME: str = "Feedback Intelligence Platform"
    ENVIRONMENT: str = "development"
    DEBUG: bool = True
    API_V1_STR: str = "/api/v1"
    HOST: str = "0.0.0.0"
    PORT: int = 8000

    # Database
    DATABASE_URL: str = "postgresql://feedback_user:feedback_password@localhost:5432/feedback_intelligence"
    TEST_DATABASE_URL: str = "sqlite:///./test_feedback.db"
    DB_ECHO: bool = False

    # Redis & Celery
    REDIS_URL: str = "redis://localhost:6379/0"
    CELERY_BROKER_URL: str = "redis://localhost:6379/0"
    CELERY_RESULT_BACKEND: str = "redis://localhost:6379/1"

    # LLM Settings (OpenAI-compatible)
    OPENAI_API_KEY: Optional[str] = None
    OPENAI_BASE_URL: str = "https://api.openai.com/v1"
    LLM_MODEL: str = "gpt-4o-mini"
    LLM_TEMPERATURE: float = 0.2
    LLM_TIMEOUT_SECONDS: int = 30

    # NLP & Embedding Model Identifiers
    EMBEDDING_MODEL: str = "BAAI/bge-base-en-v1.5"
    EMBEDDING_DIMENSION: int = 768
    SENTIMENT_MODEL: str = "cardiffnlp/twitter-roberta-base-sentiment-latest"
    INTENT_MODEL: str = "distilbert-base-uncased"

    # Explainable Priority Engine Weights (sum = 1.0)
    PRIORITY_WEIGHT_FREQUENCY: float = 0.25
    PRIORITY_WEIGHT_SEVERITY: float = 0.25
    PRIORITY_WEIGHT_GROWTH: float = 0.20
    PRIORITY_WEIGHT_USER_IMPACT: float = 0.15
    PRIORITY_WEIGHT_NEGATIVE_SENTIMENT: float = 0.15

    # Trend Detection Parameters
    MIN_VOLUME_FOR_EMERGING: int = 5
    EMERGING_GROWTH_THRESHOLD: float = 0.50  # 50% growth rate

    @property
    def is_production(self) -> bool:
        return self.ENVIRONMENT.lower() == "production"

    @property
    def is_testing(self) -> bool:
        return self.ENVIRONMENT.lower() == "testing"


@lru_cache()
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
