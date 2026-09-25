import uuid
from datetime import datetime
from typing import List, TYPE_CHECKING
from sqlalchemy import String, DateTime, Uuid
from sqlalchemy.orm import Mapped, mapped_column, relationship
from backend.app.db.base import Base, utc_now

if TYPE_CHECKING:
    from backend.app.models.youtube import YouTubeChannel, YouTubeVideo
    from backend.app.models.feedback import Feedback


class Business(Base):
    __tablename__ = "businesses"

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    name: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, onupdate=utc_now, nullable=False)

    # Relationships
    youtube_channels: Mapped[List["YouTubeChannel"]] = relationship(
        "YouTubeChannel", back_populates="business", cascade="all, delete-orphan"
    )
    youtube_videos: Mapped[List["YouTubeVideo"]] = relationship(
        "YouTubeVideo", back_populates="business", cascade="all, delete-orphan"
    )
    feedbacks: Mapped[List["Feedback"]] = relationship(
        "Feedback", back_populates="business", cascade="all, delete-orphan"
    )
