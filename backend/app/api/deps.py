from typing import Generator
from fastapi import Depends
from sqlalchemy.orm import Session

from backend.app.db.session import get_db
from backend.app.services.youtube import YouTubeSyncService


def get_youtube_sync_service(
    db: Session = Depends(get_db),
) -> YouTubeSyncService:
    """Dependency that provides an initialized YouTubeSyncService."""
    return YouTubeSyncService(db=db)
