import os
from celery import Celery
from app.core.config import settings
from app.core.logging import logger

broker_url = settings.CELERY_BROKER_URL or settings.REDIS_URL
result_backend = settings.CELERY_RESULT_BACKEND or settings.REDIS_URL

celery = Celery(
    "feedback_intelligence",
    broker=broker_url,
    backend=result_backend,
    include=["app.workers.tasks"],
)

celery.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    task_track_started=True,
    task_time_limit=300,        # 5 minutes max per task
    task_soft_time_limit=240,
    worker_concurrency=2,
    worker_prefetch_multiplier=1,
    task_always_eager=settings.is_testing,
    task_eager_propagates=settings.is_testing,
)

logger.info(f"Celery initialized with broker: {broker_url}")
