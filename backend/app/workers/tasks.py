from typing import List, Dict, Any
from app.workers.celery_app import celery
from app.core.logging import logger
from app.db.database import SessionLocal
from app.db.repositories.feedback_repository import FeedbackRepository
from app.nlp.pipeline import NLPPipeline
from app.intelligence.insight_engine import IntelligenceCoordinator


@celery.task(bind=True, max_retries=3, default_retry_delay=10)
def process_feedback_item_task(self, feedback_id: str) -> Dict[str, Any]:
    """Asynchronously process a single feedback item through the NLP pipeline."""
    db = SessionLocal()
    try:
        feedback_repo = FeedbackRepository(db)
        existing = feedback_repo.get_by_feedback_id(feedback_id)
        if not existing:
            logger.warning(f"Celery task: Feedback ID '{feedback_id}' not found.")
            return {"status": "not_found", "feedback_id": feedback_id}

        # Idempotency check: if analysis already exists, skip
        if existing.analysis:
            logger.info(f"Celery task: Feedback ID '{feedback_id}' already analyzed. Skipping.")
            return {"status": "already_processed", "feedback_id": feedback_id}

        pipeline = NLPPipeline(db)
        analysis = pipeline.process_feedback_item(feedback_id)

        return {
            "status": "success",
            "feedback_id": feedback_id,
            "sentiment": analysis.sentiment if analysis else None,
            "intent": analysis.intent if analysis else None,
        }
    except Exception as exc:
        logger.error(f"Error in process_feedback_item_task for '{feedback_id}': {exc}", exc_info=True)
        raise self.retry(exc=exc)
    finally:
        db.close()


@celery.task(bind=True, max_retries=3, default_retry_delay=15)
def process_feedback_batch_task(self, feedback_ids: List[str]) -> Dict[str, Any]:
    """Asynchronously process a batch of feedback items."""
    db = SessionLocal()
    try:
        pipeline = NLPPipeline(db)
        analyses = pipeline.process_batch(feedback_ids)
        return {
            "status": "success",
            "requested_count": len(feedback_ids),
            "processed_count": len(analyses),
        }
    except Exception as exc:
        logger.error(f"Error in process_feedback_batch_task: {exc}", exc_info=True)
        raise self.retry(exc=exc)
    finally:
        db.close()


@celery.task(bind=True, max_retries=2, default_retry_delay=30)
def run_full_intelligence_cycle_task(self) -> Dict[str, Any]:
    """Periodic or triggered worker task that clusters problems and computes trends/priorities."""
    db = SessionLocal()
    try:
        pipeline = NLPPipeline(db)
        discovered = pipeline.discover_problems()

        coordinator = IntelligenceCoordinator(db)
        cycle_result = coordinator.run_full_intelligence_cycle()

        return {
            "status": "success",
            "clusters_discovered": len(discovered),
            **cycle_result,
        }
    except Exception as exc:
        logger.error(f"Error in run_full_intelligence_cycle_task: {exc}", exc_info=True)
        raise self.retry(exc=exc)
    finally:
        db.close()
