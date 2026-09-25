from typing import List, Optional, Tuple, Dict, Any
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func, desc

from app.db.models import Feedback, FeedbackAnalysis, FeedbackEmbedding
from app.schemas.feedback import CanonicalFeedbackInput


class FeedbackRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_feedback_id(self, feedback_id: str) -> Optional[Feedback]:
        return (
            self.db.query(Feedback)
            .options(joinedload(Feedback.analysis), joinedload(Feedback.embedding))
            .filter(Feedback.feedback_id == feedback_id)
            .first()
        )

    def get_all(
        self,
        skip: int = 0,
        limit: int = 50,
        source: Optional[str] = None,
        sentiment: Optional[str] = None,
        intent: Optional[str] = None,
    ) -> Tuple[List[Feedback], int]:
        query = self.db.query(Feedback).options(joinedload(Feedback.analysis))

        if source:
            query = query.filter(Feedback.source == source)

        if sentiment or intent:
            query = query.join(Feedback.analysis)
            if sentiment:
                query = query.filter(FeedbackAnalysis.sentiment == sentiment)
            if intent:
                query = query.filter(FeedbackAnalysis.intent == intent)

        total = query.count()
        items = query.order_by(desc(Feedback.created_at)).offset(skip).limit(limit).all()
        return items, total

    def create(self, item: CanonicalFeedbackInput) -> Feedback:
        existing = self.get_by_feedback_id(item.feedback_id)
        if existing:
            return existing

        db_feedback = Feedback(
            feedback_id=item.feedback_id,
            source=item.source,
            source_url=item.source_url,
            text=item.text,
            rating=item.rating,
            created_at=item.created_at,
            extra_metadata=item.metadata or {},
        )
        self.db.add(db_feedback)
        self.db.commit()
        self.db.refresh(db_feedback)
        return db_feedback

    def create_batch(self, items: List[CanonicalFeedbackInput]) -> List[Feedback]:
        created_records: List[Feedback] = []
        for item in items:
            existing = self.get_by_feedback_id(item.feedback_id)
            if not existing:
                db_item = Feedback(
                    feedback_id=item.feedback_id,
                    source=item.source,
                    source_url=item.source_url,
                    text=item.text,
                    rating=item.rating,
                    created_at=item.created_at,
                    extra_metadata=item.metadata or {},
                )
                self.db.add(db_item)
                created_records.append(db_item)

        if created_records:
            self.db.commit()
            for r in created_records:
                self.db.refresh(r)

        return created_records

    def get_unprocessed(self, limit: int = 100) -> List[Feedback]:
        """Fetch feedback items that don't have an associated analysis record yet."""
        return (
            self.db.query(Feedback)
            .outerjoin(Feedback.analysis)
            .filter(FeedbackAnalysis.id.is_(None))
            .order_by(Feedback.created_at.asc())
            .limit(limit)
            .all()
        )

    def count(self) -> int:
        return self.db.query(func.count(Feedback.id)).scalar() or 0

    def count_analyzed(self) -> int:
        return self.db.query(func.count(FeedbackAnalysis.id)).scalar() or 0

    def get_sentiment_distribution(self) -> Dict[str, int]:
        results = (
            self.db.query(FeedbackAnalysis.sentiment, func.count(FeedbackAnalysis.id))
            .group_by(FeedbackAnalysis.sentiment)
            .all()
        )
        return {sentiment: count for sentiment, count in results}

    def get_intent_distribution(self) -> Dict[str, int]:
        results = (
            self.db.query(FeedbackAnalysis.intent, func.count(FeedbackAnalysis.id))
            .group_by(FeedbackAnalysis.intent)
            .all()
        )
        return {intent: count for intent, count in results}

    def get_source_distribution(self) -> Dict[str, int]:
        results = (
            self.db.query(Feedback.source, func.count(Feedback.id))
            .group_by(Feedback.source)
            .all()
        )
        return {source: count for source, count in results}

    def save_analysis(
        self,
        feedback_id: str,
        sentiment: str,
        sentiment_confidence: float,
        intent: str,
        intent_confidence: float,
        cleaned_text: str,
        language: str = "en",
        is_noise: bool = False,
        is_duplicate: bool = False,
        duplicate_of: Optional[str] = None,
    ) -> FeedbackAnalysis:
        analysis = (
            self.db.query(FeedbackAnalysis)
            .filter(FeedbackAnalysis.feedback_id == feedback_id)
            .first()
        )
        if not analysis:
            analysis = FeedbackAnalysis(
                feedback_id=feedback_id,
                sentiment=sentiment,
                sentiment_confidence=sentiment_confidence,
                intent=intent,
                intent_confidence=intent_confidence,
                cleaned_text=cleaned_text,
                language=language,
                is_noise=is_noise,
                is_duplicate=is_duplicate,
                duplicate_of=duplicate_of,
            )
            self.db.add(analysis)
        else:
            analysis.sentiment = sentiment
            analysis.sentiment_confidence = sentiment_confidence
            analysis.intent = intent
            analysis.intent_confidence = intent_confidence
            analysis.cleaned_text = cleaned_text
            analysis.language = language
            analysis.is_noise = is_noise
            analysis.is_duplicate = is_duplicate
            analysis.duplicate_of = duplicate_of

        self.db.commit()
        self.db.refresh(analysis)
        return analysis

    def save_embedding(
        self,
        feedback_id: str,
        embedding: List[float],
        model_name: str = "BAAI/bge-base-en-v1.5",
    ) -> FeedbackEmbedding:
        emb = (
            self.db.query(FeedbackEmbedding)
            .filter(FeedbackEmbedding.feedback_id == feedback_id)
            .first()
        )
        if not emb:
            emb = FeedbackEmbedding(
                feedback_id=feedback_id,
                embedding=embedding,
                model_name=model_name,
            )
            self.db.add(emb)
        else:
            emb.embedding = embedding
            emb.model_name = model_name

        self.db.commit()
        self.db.refresh(emb)
        return emb
