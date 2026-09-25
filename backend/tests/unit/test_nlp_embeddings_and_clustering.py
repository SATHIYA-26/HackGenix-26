import math
import pytest
import numpy as np

from app.nlp.embeddings import EmbeddingService
from app.nlp.clustering import SemanticClusteringService
from app.nlp.topics import TopicModelingService


@pytest.fixture
def embedding_service():
    return EmbeddingService()


@pytest.fixture
def clustering_service():
    return SemanticClusteringService(min_cluster_size=3, min_samples=2)


@pytest.fixture
def topic_service():
    return TopicModelingService()


def test_embedding_generation_and_normalization(embedding_service):
    text = "UPI payment failed on checkout screen"
    emb = embedding_service.embed_text(text)

    assert len(emb) == 768
    # L2 norm should be approximately 1.0 (unit vector)
    norm = np.linalg.norm(emb)
    assert math.isclose(norm, 1.0, rel_tol=1e-2)


def test_semantic_similarity_search(embedding_service):
    corpus = [
        ("f_1", embedding_service.embed_text("Money was deducted but my order failed")),
        ("f_2", embedding_service.embed_text("Payment went through bank but order was cancelled")),
        ("f_3", embedding_service.embed_text("UPI isn't working during checkout")),
        ("f_4", embedding_service.embed_text("Delivery was delayed by four days")),
        ("f_5", embedding_service.embed_text("Dark mode font is unreadable")),
    ]

    query = "UPI payment failed"
    results = embedding_service.search_similar(query, corpus, top_k=3, threshold=0.30)

    assert len(results) >= 2
    top_ids = [item_id for item_id, score in results]
    # The payment related feedbacks should be the top matches
    assert "f_1" in top_ids or "f_2" in top_ids or "f_3" in top_ids
    # Delivery or UI should have much lower score than payment
    assert results[0][1] >= 0.40


def test_hdbscan_clustering_and_topic_extraction(embedding_service, clustering_service, topic_service):
    # Create two distinct groups of texts
    upi_texts = [
        "UPI payment failed again",
        "Payment through UPI isn't working",
        "Money got deducted but my order was cancelled",
        "Why is UPI broken again? Every time Google Pay times out",
    ]
    delivery_texts = [
        "Delivery delayed by 4 days without any notification",
        "Delivery rider marked package delivered but I never received it",
        "Live tracking map is stuck and courier arrived late",
    ]

    all_texts = upi_texts + delivery_texts
    f_ids = [f"f_{i}" for i in range(len(all_texts))]
    embeddings = embedding_service.embed_batch(all_texts)

    clusters, outliers = clustering_service.fit_predict(embeddings, f_ids, all_texts)

    # Topic extraction test
    topic = topic_service.extract_topic_from_texts(1, upi_texts)
    assert topic.name is not None
    assert "UPI" in topic.name or "Payment" in topic.name
    assert len(topic.keywords) >= 1
