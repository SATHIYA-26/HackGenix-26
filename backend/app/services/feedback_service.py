from typing import List, Optional, Tuple, Dict, Any
from sqlalchemy.orm import Session

from app.db.repositories.feedback_repository import FeedbackRepository
from app.db.models import Feedback
from app.schemas.feedback import CanonicalFeedbackInput, FeedbackResponse
from app.core.exceptions import ResourceNotFoundException, DuplicateFeedbackException
from app.core.logging import logger


class FeedbackService:
    def __init__(self, db: Session):
        self.db = db
        self.feedback_repo = FeedbackRepository(db)

    def ingest_feedback(self, data: CanonicalFeedbackInput, trigger_async: bool = True) -> Feedback:
        """Store raw canonical feedback and optionally trigger async background processing."""
        existing = self.feedback_repo.get_by_feedback_id(data.feedback_id)
        if existing:
            logger.info(f"Feedback with ID '{data.feedback_id}' already exists. Returning existing entity.")
            return existing

        db_feedback = self.feedback_repo.create(data)
        logger.info(f"Feedback ingested successfully: id={db_feedback.id}, feedback_id='{db_feedback.feedback_id}'")

        if trigger_async:
            self._dispatch_background_task(db_feedback.feedback_id)

        return db_feedback

    def ingest_batch(self, items: List[CanonicalFeedbackInput], trigger_async: bool = True) -> List[Feedback]:
        """Ingest multiple canonical feedback items in a single transaction."""
        created_records = self.feedback_repo.create_batch(items)
        logger.info(f"Batch ingested {len(created_records)} new feedback records out of {len(items)} submitted.")

        if trigger_async and created_records:
            feedback_ids = [r.feedback_id for r in created_records]
            self._dispatch_batch_background_tasks(feedback_ids)

        return created_records

    def get_by_id(self, feedback_id: str) -> Feedback:
        record = self.feedback_repo.get_by_feedback_id(feedback_id)
        if not record:
            raise ResourceNotFoundException(f"Feedback with ID '{feedback_id}' was not found.")
        return record

    def list_feedback(
        self,
        page: int = 1,
        limit: int = 50,
        source: Optional[str] = None,
        sentiment: Optional[str] = None,
        intent: Optional[str] = None,
    ) -> Tuple[List[Feedback], int]:
        skip = (page - 1) * limit
        return self.feedback_repo.get_all(
            skip=skip,
            limit=limit,
            source=source,
            sentiment=sentiment,
            intent=intent,
        )

    def _dispatch_background_task(self, feedback_id: str) -> None:
        """Safely attempt to dispatch to Celery worker; fails gracefully if Redis/Celery is offline."""
        try:
            from app.workers.tasks import process_feedback_item_task
            process_feedback_item_task.delay(feedback_id)
            logger.debug(f"Dispatched Celery task for feedback_id='{feedback_id}'")
        except Exception as exc:
            logger.debug(f"Celery task dispatch skipped or deferred (broker might be offline in local dev/test): {exc}")

    def _dispatch_batch_background_tasks(self, feedback_ids: List[str]) -> None:
        """Safely attempt to dispatch batch to Celery worker."""
        try:
            from app.workers.tasks import process_feedback_batch_task
            process_feedback_batch_task.delay(feedback_ids)
            logger.debug(f"Dispatched Celery batch task for {len(feedback_ids)} items.")
        except Exception as exc:
            logger.debug(f"Celery batch task dispatch skipped or deferred: {exc}")
