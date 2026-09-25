from typing import List, Dict, Any, Tuple, Optional
from sqlalchemy.orm import Session

from app.core.logging import logger
from app.db.models import Feedback, FeedbackAnalysis, FeedbackEmbedding, ProblemCluster
from app.db.repositories.feedback_repository import FeedbackRepository
from app.db.repositories.problem_repository import ProblemRepository

from app.nlp.preprocessing import text_preprocessor, PreprocessedText
from app.nlp.sentiment import get_sentiment_service
from app.nlp.intent import get_intent_service
from app.nlp.embeddings import get_embedding_service
from app.nlp.clustering import get_clustering_service
from app.nlp.topics import get_topic_service


class NLPPipeline:
    """Unified NLP Pipeline orchestrator.
    
    Coordinates Preprocessing -> Sentiment -> Intent -> Embeddings -> HDBSCAN Clustering -> BERTopic Discovery.
    """

    def __init__(self, db: Session):
        self.db = db
        self.feedback_repo = FeedbackRepository(db)
        self.problem_repo = ProblemRepository(db)

        self.preprocessor = text_preprocessor
        self.sentiment_service = get_sentiment_service()
        self.intent_service = get_intent_service()
        self.embedding_service = get_embedding_service()
        self.clustering_service = get_clustering_service()
        self.topic_service = get_topic_service()

    def process_feedback_item(self, feedback_id: str) -> Optional[FeedbackAnalysis]:
        """Process a single feedback item through NLP pipeline and store analysis + embeddings."""
        item = self.feedback_repo.get_by_feedback_id(feedback_id)
        if not item:
            logger.warning(f"Feedback with ID '{feedback_id}' not found. Cannot process.")
            return None

        # 1. Preprocessing & Deduplication
        preprocessed = self.preprocessor.preprocess(item.feedback_id, item.text)

        # 2. Sentiment Analysis
        sentiment_res = self.sentiment_service.analyze_text(preprocessed.cleaned_text)

        # 3. Intent Classification
        intent_res = self.intent_service.classify_text(preprocessed.cleaned_text)

        # 4. Save Analysis record
        analysis = self.feedback_repo.save_analysis(
            feedback_id=item.feedback_id,
            sentiment=sentiment_res.sentiment.value,
            sentiment_confidence=sentiment_res.confidence,
            intent=intent_res.intent.value,
            intent_confidence=intent_res.confidence,
            cleaned_text=preprocessed.cleaned_text,
            language=preprocessed.language,
            is_noise=preprocessed.is_noise,
            is_duplicate=preprocessed.is_duplicate,
            duplicate_of=preprocessed.duplicate_of,
        )

        # 5. Generate & Save Vector Embedding (if not spam/noise)
        if not preprocessed.is_noise:
            embedding = self.embedding_service.embed_text(preprocessed.cleaned_text)
            self.feedback_repo.save_embedding(
                feedback_id=item.feedback_id,
                embedding=embedding,
                model_name=self.embedding_service.model_name,
            )

        logger.info(
            f"NLP enriched feedback '{feedback_id}': sentiment={analysis.sentiment} ({analysis.sentiment_confidence}), "
            f"intent={analysis.intent} ({analysis.intent_confidence}), noise={analysis.is_noise}"
        )
        return analysis

    def process_batch(self, feedback_ids: List[str]) -> List[FeedbackAnalysis]:
        """Bulk process feedback items through batch NLP inference."""
        if not feedback_ids:
            return []

        items = [self.feedback_repo.get_by_feedback_id(fid) for fid in feedback_ids]
        valid_items = [i for i in items if i is not None]
        if not valid_items:
            return []

        # 1. Batch Preprocessing
        preprocessed_list = [
            self.preprocessor.preprocess(item.feedback_id, item.text)
            for item in valid_items
        ]
        cleaned_texts = [p.cleaned_text for p in preprocessed_list]

        # 2. Batch Sentiment & Intent
        sentiments = self.sentiment_service.analyze_batch(cleaned_texts)
        intents = self.intent_service.classify_batch(cleaned_texts)

        # 3. Batch Embeddings for non-noise items
        non_noise_indices = [idx for idx, p in enumerate(preprocessed_list) if not p.is_noise]
        non_noise_texts = [cleaned_texts[idx] for idx in non_noise_indices]
        embeddings = self.embedding_service.embed_batch(non_noise_texts)

        embedding_map = {
            valid_items[non_noise_indices[k]].feedback_id: embeddings[k]
            for k in range(len(non_noise_indices))
        }

        # 4. Save all records
        analyses = []
        for idx, item in enumerate(valid_items):
            p = preprocessed_list[idx]
            s = sentiments[idx]
            i = intents[idx]

            analysis = self.feedback_repo.save_analysis(
                feedback_id=item.feedback_id,
                sentiment=s.sentiment.value,
                sentiment_confidence=s.confidence,
                intent=i.intent.value,
                intent_confidence=i.confidence,
                cleaned_text=p.cleaned_text,
                language=p.language,
                is_noise=p.is_noise,
                is_duplicate=p.is_duplicate,
                duplicate_of=p.duplicate_of,
            )
            analyses.append(analysis)

            if item.feedback_id in embedding_map:
                self.feedback_repo.save_embedding(
                    feedback_id=item.feedback_id,
                    embedding=embedding_map[item.feedback_id],
                    model_name=self.embedding_service.model_name,
                )

        logger.info(f"Processed batch of {len(analyses)} feedback items through NLP pipeline.")
        return analyses

    def discover_problems(self) -> List[ProblemCluster]:
        """Perform HDBSCAN density clustering and BERTopic problem discovery on all valid embeddings.
        
        Discovers problem clusters, extracts human-readable problem topics, and links feedback.
        """
        # Fetch all feedback items that have embeddings and are not noise
        embeddings_records = (
            self.db.query(FeedbackEmbedding, FeedbackAnalysis, Feedback)
            .join(FeedbackAnalysis, FeedbackAnalysis.feedback_id == FeedbackEmbedding.feedback_id)
            .join(Feedback, Feedback.feedback_id == FeedbackEmbedding.feedback_id)
            .filter(FeedbackAnalysis.is_noise.is_(False))
            .all()
        )

        if len(embeddings_records) < 5:
            logger.info("Fewer than 5 feedback embeddings available. Skipping problem discovery.")
            return []

        feedback_ids = [record[0].feedback_id for record in embeddings_records]
        embeddings = [record[0].embedding for record in embeddings_records]
        texts = [record[1].cleaned_text for record in embeddings_records]

        # Convert embedding JSON strings to lists if stored as string in SQLite
        clean_embeddings = []
        for emb in embeddings:
            if isinstance(emb, list):
                clean_embeddings.append(emb)
            else:
                import json
                clean_embeddings.append(json.loads(emb))

        # 1. Run HDBSCAN clustering
        clusters, outliers = self.clustering_service.fit_predict(
            embeddings=clean_embeddings,
            feedback_ids=feedback_ids,
            texts=texts,
        )

        discovered_problems: List[ProblemCluster] = []

        # 2. For each cluster, extract topic & create/update ProblemCluster entity
        for cluster_id, cluster_res in clusters.items():
            topic_def = self.topic_service.extract_topic_from_texts(
                cluster_id=cluster_id,
                texts=cluster_res.texts,
            )

            # Compute average sentiment for this cluster
            cluster_sentiments = []
            for fid in cluster_res.feedback_ids:
                # Find matching record
                for r in embeddings_records:
                    if r[0].feedback_id == fid:
                        sent_val = -1.0 if r[1].sentiment == "negative" else (1.0 if r[1].sentiment == "positive" else 0.0)
                        cluster_sentiments.append(sent_val)
                        break

            avg_sentiment = sum(cluster_sentiments) / len(cluster_sentiments) if cluster_sentiments else 0.0

            # Derive base severity (higher for negative sentiment clusters)
            neg_ratio = sum(1 for s in cluster_sentiments if s < 0) / len(cluster_sentiments) if cluster_sentiments else 0.0
            severity = round(min(1.0, 0.4 + (neg_ratio * 0.5)), 2)
            user_impact = round(min(1.0, 0.3 + (len(cluster_res.feedback_ids) / 100.0)), 2)

            # Create or update problem in DB
            problem = self.problem_repo.create_or_update(
                name=topic_def.name,
                description=topic_def.description,
                feedback_count=len(cluster_res.feedback_ids),
                average_sentiment=round(avg_sentiment, 2),
                growth_rate=0.0,  # Will be updated by Trend Engine in Phase 3
                severity=severity,
                user_impact=user_impact,
                priority_score=0.50,  # Will be computed by Priority Engine in Phase 3
                frequency_score=round(min(1.0, len(cluster_res.feedback_ids) / 50.0), 2),
                severity_score=severity,
                growth_score=0.50,
                user_impact_score=user_impact,
                negative_sentiment_score=round(neg_ratio, 2),
            )

            # Link feedback items to this problem
            for fid in cluster_res.feedback_ids:
                self.problem_repo.link_feedback(problem.id, fid, relevance_score=1.0)

            discovered_problems.append(problem)

        logger.info(f"Problem discovery created/updated {len(discovered_problems)} problem clusters.")
        return discovered_problems
