from typing import Generator
from fastapi import Depends
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.services.feedback_service import FeedbackService


def get_feedback_service(db: Session = Depends(get_db)) -> FeedbackService:
    return FeedbackService(db)
