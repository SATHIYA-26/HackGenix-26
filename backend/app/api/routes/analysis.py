from typing import List, Optional
from fastapi import APIRouter, Depends, status, Query, HTTPException
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.db.models import Feedback, FeedbackEmbedding
from app.db.repositories.feedback_repository import FeedbackRepository
from app.schemas.analysis import AnalysisRunRequest, AnalysisRunResponse
from app.nlp.pipeline import NLPPipeline
from app.nlp.embeddings import get_embedding_service
from app.core.logging import logger

router = APIRouter(prefix="/analysis", tags=["NLP & Analysis"])


@router.post(
    "/run",
    response_model=AnalysisRunResponse,
    status_code=status.HTTP_200_OK,
    summary="Run NLP analysis and problem discovery",
    description="Trigger preprocessing, sentiment analysis, intent classification, embeddings, and clustering.",
)
def run_analysis(
    payload: AnalysisRunRequest,
    db: Session = Depends(get_db),
):
    feedback_repo = FeedbackRepository(db)
    pipeline = NLPPipeline(db)

    # 1. Fetch items to process
    if payload.reprocess_all:
        items, _ = feedback_repo.get_all(limit=payload.batch_size)
    else:
        items = feedback_repo.get_unprocessed(limit=payload.batch_size)

    feedback_ids = [item.feedback_id for item in items]
    processed_analyses = pipeline.process_batch(feedback_ids)

    # 2. Run clustering and problem discovery if requested
    clusters_count = 0
    if payload.run_clustering and (len(processed_analyses) > 0 or feedback_repo.count_analyzed() >= 5):
        discovered = pipeline.discover_problems()
        clusters_count = len(discovered)

    return AnalysisRunResponse(
        status="completed",
        processed_count=len(processed_analyses),
        clusters_discovered=clusters_count,
        message=f"Successfully analyzed {len(processed_analyses)} feedback items and identified {clusters_count} problem clusters.",
    )


@router.get(
    "/search",
    summary="Semantic similarity search over customer feedback",
    description="Vector similarity search using BAAI/bge-base-en-v1.5 embeddings to retrieve semantically related feedback.",
)
def semantic_search(
    query: str = Query(..., min_length=2, description="Natural language search query, e.g. 'UPI payment failed'"),
    top_k: int = Query(5, ge=1, le=50, description="Max results to return"),
    threshold: float = Query(0.40, ge=0.0, le=1.0, description="Minimum cosine similarity threshold"),
    db: Session = Depends(get_db),
):
    embedding_service = get_embedding_service()

    # Query feedback embeddings from DB
    records = (
        db.query(FeedbackEmbedding, Feedback)
        .join(Feedback, Feedback.feedback_id == FeedbackEmbedding.feedback_id)
        .all()
    )

    if not records:
        return {"query": query, "results": [], "total_searched": 0}

    corpus = []
    metadata_map = {}
    for emb_rec, f_rec in records:
        emb = emb_rec.embedding
        if not isinstance(emb, list):
            import json
            try:
                emb = json.loads(emb)
            except Exception:
                continue
        corpus.append((f_rec.feedback_id, emb))
        metadata_map[f_rec.feedback_id] = {
            "feedback_id": f_rec.feedback_id,
            "source": f_rec.source,
            "source_url": f_rec.source_url,
            "text": f_rec.text,
            "rating": f_rec.rating,
            "created_at": f_rec.created_at.isoformat(),
        }

    scored = embedding_service.search_similar(query, corpus, top_k=top_k, threshold=threshold)

    results = []
    for fid, score in scored:
        item_info = metadata_map.get(fid, {})
        item_info["similarity_score"] = score
        results.append(item_info)

    return {
        "query": query,
        "results": results,
        "total_searched": len(corpus),
    }
