import uuid
from datetime import datetime
from typing import Optional, Any, Dict, TYPE_CHECKING
from sqlalchemy import String, Text, Float, DateTime, ForeignKey, UniqueConstraint, Uuid, JSON
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship
from backend.app.db.base import Base, utc_now

if TYPE_CHECKING:
    from backend.app.models.business import Business


class Feedback(Base):
    __tablename__ = "feedback"
    __table_args__ = (
        UniqueConstraint("business_id", "source", "external_id", name="uq_feedback_business_source_external"),
    )

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    business_id: Mapped[uuid.UUID] = mapped_column(
        Uuid, ForeignKey("businesses.id", ondelete="CASCADE"), nullable=False, index=True
    )
    source: Mapped[str] = mapped_column(String(50), nullable=False, index=True)  # e.g., "youtube"
    source_type: Mapped[str] = mapped_column(String(50), nullable=False, default="comment")  # e.g., "comment"
    external_id: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    parent_external_id: Mapped[Optional[str]] = mapped_column(String(255), nullable=True, index=True)
    author_name: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    author_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    text: Mapped[str] = mapped_column(Text, nullable=False)
    rating: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    rating_scale: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    updated_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    source_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    
    # "metadata" column in database (JSONB on PostgreSQL, JSON on SQLite/others)
    metadata_json: Mapped[Optional[Dict[str, Any]]] = mapped_column(
        "metadata", JSON().with_variant(JSONB, "postgresql"), nullable=True, default=dict
    )
    
    ingested_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, nullable=False)

    # Relationships
    business: Mapped["Business"] = relationship("Business", back_populates="feedbacks")
