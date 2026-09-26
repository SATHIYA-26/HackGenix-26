from datetime import datetime
from typing import Any, Dict, List, Optional
import json

from sqlalchemy import (
    Column,
    Integer,
    String,
    Float,
    Text,
    DateTime,
    Boolean,
    ForeignKey,
    Index,
    Table,
    TypeDecorator,
)
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.types import JSON
from sqlalchemy.orm import relationship

from app.db.database import Base


# Cross-dialect Vector type: uses pgvector.sqlalchemy.Vector on Postgres, JSON on SQLite/others
class CrossDialectVector(TypeDecorator):
    impl = Text
    cache_ok = True

    def __init__(self, dim: int = 768, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.dim = dim

    def load_dialect_impl(self, dialect):
        if dialect.name == "postgresql":
            try:
                from pgvector.sqlalchemy import Vector
                return dialect.type_descriptor(Vector(self.dim))
            except ImportError:
                return dialect.type_descriptor(Text())
        return dialect.type_descriptor(Text())

    def process_bind_param(self, value, dialect):
        if value is None:
            return None
        if dialect.name == "postgresql":
            return value
        if isinstance(value, (list, tuple)):
            return json.dumps([float(x) for x in value])
        return str(value)

    def process_result_value(self, value, dialect):
        if value is None:
            return None
        if isinstance(value, (list, tuple)):
            return [float(x) for x in value]
        if isinstance(value, str):
            try:
                parsed = json.loads(value)
                if isinstance(parsed, list):
                    return [float(x) for x in parsed]
            except Exception:
                pass
        return value


# Problem-Feedback Association Table
problem_feedback = Table(
    "problem_feedback",
    Base.metadata,
    Column("problem_id", Integer, ForeignKey("problem_clusters.id", ondelete="CASCADE"), primary_key=True),
    Column("feedback_id", String(128), ForeignKey("feedback.feedback_id", ondelete="CASCADE"), primary_key=True),
    Column("relevance_score", Float, default=1.0),
    Column("created_at", DateTime, default=datetime.utcnow),
)


class Feedback(Base):
    """Raw Canonical Feedback Entity."""
    __tablename__ = "feedback"

    id = Column(Integer, primary_key=True, autoincrement=True)
    feedback_id = Column(String(128), unique=True, nullable=False, index=True)
    source = Column(String(64), nullable=False, index=True)
    source_url = Column(String(512), nullable=True)
    text = Column(Text, nullable=False)
    rating = Column(Float, nullable=True)
    account_id = Column(String(64), nullable=True, index=True, default="acc_manis")
    created_at = Column(DateTime, nullable=False, index=True)
    extra_metadata = Column("metadata", JSON, nullable=True)
    created_at_db = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    analysis = relationship("FeedbackAnalysis", back_populates="feedback", uselist=False, cascade="all, delete-orphan")
    embedding = relationship("FeedbackEmbedding", back_populates="feedback", uselist=False, cascade="all, delete-orphan")
    problems = relationship("ProblemCluster", secondary=problem_feedback, back_populates="feedback_items")

    def __repr__(self) -> str:
        return f"<Feedback(feedback_id='{self.feedback_id}', source='{self.source}')>"


class FeedbackAnalysis(Base):
    """Enriched NLP Attributes for Feedback."""
    __tablename__ = "feedback_analysis"

    id = Column(Integer, primary_key=True, autoincrement=True)
    feedback_id = Column(String(128), ForeignKey("feedback.feedback_id", ondelete="CASCADE"), unique=True, nullable=False, index=True)
    sentiment = Column(String(32), nullable=False)  # positive, negative, neutral
    sentiment_confidence = Column(Float, nullable=False)
    intent = Column(String(64), nullable=False)     # payment_issue, login_issue, bug, etc.
    intent_confidence = Column(Float, nullable=False)
    cleaned_text = Column(Text, nullable=False)
    language = Column(String(16), default="en", nullable=False)
    is_noise = Column(Boolean, default=False, nullable=False)
    is_duplicate = Column(Boolean, default=False, nullable=False)
    duplicate_of = Column(String(128), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationship
    feedback = relationship("Feedback", back_populates="analysis")

    def __repr__(self) -> str:
        return f"<FeedbackAnalysis(feedback_id='{self.feedback_id}', sentiment='{self.sentiment}', intent='{self.intent}')>"


class FeedbackEmbedding(Base):
    """Vector Embeddings for Feedback (pgvector / cross-dialect)."""
    __tablename__ = "feedback_embeddings"

    id = Column(Integer, primary_key=True, autoincrement=True)
    feedback_id = Column(String(128), ForeignKey("feedback.feedback_id", ondelete="CASCADE"), unique=True, nullable=False, index=True)
    embedding = Column(CrossDialectVector(dim=768), nullable=False)
    model_name = Column(String(128), default="BAAI/bge-base-en-v1.5", nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationship
    feedback = relationship("Feedback", back_populates="embedding")

    def __repr__(self) -> str:
        return f"<FeedbackEmbedding(feedback_id='{self.feedback_id}', model='{self.model_name}')>"


class ProblemCluster(Base):
    """Discovered Problem / Topic Cluster."""
    __tablename__ = "problem_clusters"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(256), nullable=False, index=True)
    description = Column(Text, nullable=False)
    feedback_count = Column(Integer, default=0, nullable=False)
    average_sentiment = Column(Float, default=0.0, nullable=False)
    growth_rate = Column(Float, default=0.0, nullable=False)
    severity = Column(Float, default=0.0, nullable=False)
    user_impact = Column(Float, default=0.0, nullable=False)
    priority_score = Column(Float, default=0.0, nullable=False, index=True)

    # Priority breakdown components for explainability
    frequency_score = Column(Float, default=0.0, nullable=False)
    severity_score = Column(Float, default=0.0, nullable=False)
    growth_score = Column(Float, default=0.0, nullable=False)
    user_impact_score = Column(Float, default=0.0, nullable=False)
    negative_sentiment_score = Column(Float, default=0.0, nullable=False)

    # Discovered Product/Feature dimensions
    product_dimension = Column(JSON, nullable=True)  # {product, feature, issue, platform, version}
    account_id = Column(String(64), nullable=True, index=True, default="acc_manis")

    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    feedback_items = relationship("Feedback", secondary=problem_feedback, back_populates="problems")
    trends = relationship("Trend", back_populates="problem", cascade="all, delete-orphan")
    recommendations = relationship("Recommendation", back_populates="problem", cascade="all, delete-orphan")
    insights = relationship("Insight", back_populates="problem", cascade="all, delete-orphan")
    actions = relationship("Action", back_populates="problem", cascade="all, delete-orphan")

    def __repr__(self) -> str:
        return f"<ProblemCluster(id={self.id}, name='{self.name}', priority={self.priority_score})>"


class Trend(Base):
    """Time-Window Trend Analysis for Problems."""
    __tablename__ = "trends"

    id = Column(Integer, primary_key=True, autoincrement=True)
    problem_id = Column(Integer, ForeignKey("problem_clusters.id", ondelete="CASCADE"), nullable=False, index=True)
    time_window = Column(String(32), default="7d", nullable=False)
    current_count = Column(Integer, default=0, nullable=False)
    previous_count = Column(Integer, default=0, nullable=False)
    growth_rate = Column(Float, default=0.0, nullable=False)
    is_emerging = Column(Boolean, default=False, nullable=False, index=True)
    calculated_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationship
    problem = relationship("ProblemCluster", back_populates="trends")

    def __repr__(self) -> str:
        return f"<Trend(problem_id={self.problem_id}, growth={self.growth_rate}, emerging={self.is_emerging})>"


class Recommendation(Base):
    """Evidence-Backed Product Recommendations."""
    __tablename__ = "recommendations"

    id = Column(Integer, primary_key=True, autoincrement=True)
    problem_id = Column(Integer, ForeignKey("problem_clusters.id", ondelete="CASCADE"), nullable=False, index=True)
    recommendation = Column(Text, nullable=False)
    reason = Column(Text, nullable=False)
    evidence = Column(JSON, nullable=False)  # {observed, inferred, affected_components, metrics}
    confidence = Column(Float, default=0.85, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationship
    problem = relationship("ProblemCluster", back_populates="recommendations")
    actions = relationship("Action", back_populates="recommendation")

    def __repr__(self) -> str:
        return f"<Recommendation(problem_id={self.problem_id}, confidence={self.confidence})>"


class Insight(Base):
    """LLM-Synthesized Executive Problem Insight with Full Traceability."""
    __tablename__ = "insights"

    id = Column(Integer, primary_key=True, autoincrement=True)
    problem_id = Column(Integer, ForeignKey("problem_clusters.id", ondelete="CASCADE"), nullable=False, index=True)
    summary = Column(Text, nullable=False)
    why_it_matters = Column(Text, nullable=False)
    evidence = Column(JSON, nullable=False)  # Traceable feedback IDs, counts, source URLs
    recommended_actions = Column(JSON, nullable=False)  # List of concrete actions
    suggested_response = Column(Text, nullable=True)  # Customer-facing response template
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationship
    problem = relationship("ProblemCluster", back_populates="insights")

    def __repr__(self) -> str:
        return f"<Insight(problem_id={self.problem_id})>"


class Action(Base):
    """Closed-loop product action tracking implementation, release, and feedback impact."""
    __tablename__ = "actions"

    id = Column(Integer, primary_key=True, autoincrement=True)
    action_id = Column(String(64), unique=True, nullable=False, index=True)
    problem_id = Column(Integer, ForeignKey("problem_clusters.id", ondelete="CASCADE"), nullable=False, index=True)
    recommendation_id = Column(Integer, ForeignKey("recommendations.id", ondelete="SET NULL"), nullable=True, index=True)
    title = Column(String(256), nullable=False)
    account_id = Column(String(64), nullable=True, index=True, default="acc_manis")
    description = Column(Text, nullable=True)
    action_type = Column(String(64), default="bug_fix", nullable=False)
    status = Column(String(32), default="planned", nullable=False, index=True)
    assignee = Column(String(128), nullable=True)
    jira_issue_key = Column(String(64), nullable=True)
    release_version = Column(String(64), nullable=True)
    release_date = Column(DateTime, nullable=True)
    baseline_metrics = Column(JSON, nullable=True)
    post_release_metrics = Column(JSON, nullable=True)
    impact_score = Column(Float, nullable=True)
    impact_summary = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    problem = relationship("ProblemCluster", back_populates="actions")
    recommendation = relationship("Recommendation", back_populates="actions")

    def __repr__(self) -> str:
        return f"<Action(id={self.id}, action_id='{self.action_id}', status='{self.status}', version='{self.release_version}')>"

