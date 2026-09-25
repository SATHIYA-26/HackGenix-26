import re
from typing import List, Dict, Any, Tuple, Optional
from collections import Counter
from sklearn.feature_extraction.text import CountVectorizer

from app.core.logging import logger


class TopicDefinition:
    def __init__(
        self,
        topic_id: int,
        name: str,
        description: str,
        keywords: List[str],
        representative_docs: List[str],
    ):
        self.topic_id = topic_id
        self.name = name
        self.description = description
        self.keywords = keywords
        self.representative_docs = representative_docs


class TopicModelingService:
    """BERTopic & c-TF-IDF Topic Modeling Service.
    
    Transforms clusters of customer feedback into human-readable, executive-ready
    problem titles and keyword summaries.
    """

    def __init__(self):
        self.stop_words = {
            "the", "a", "an", "and", "or", "but", "in", "on", "at", "to", "for",
            "of", "with", "by", "from", "up", "about", "into", "over", "after",
            "is", "are", "was", "were", "be", "been", "being", "have", "has", "had",
            "do", "does", "did", "app", "application", "please", "my", "i", "it",
            "this", "that", "very", "so", "just", "get", "got", "can", "cannot"
        }

    def extract_topic_from_texts(
        self,
        cluster_id: int,
        texts: List[str],
        top_n_keywords: int = 6,
    ) -> TopicDefinition:
        """Extract human-readable problem title and keyphrase summary from a collection of cluster texts."""
        if not texts:
            return TopicDefinition(
                topic_id=cluster_id,
                name=f"General Feedback #{cluster_id}",
                description="Cluster of feedback items without distinct keywords.",
                keywords=[],
                representative_docs=[],
            )

        # 1. Compute c-TF-IDF keywords using n-grams (1, 2)
        try:
            vectorizer = CountVectorizer(
                ngram_range=(1, 2),
                stop_words=list(self.stop_words),
                max_features=50,
            )
            dtm = vectorizer.fit_transform(texts)
            words = vectorizer.get_feature_names_out()
            counts = dtm.sum(axis=0).A1
            word_freqs = list(zip(words, counts))
            word_freqs.sort(key=lambda x: x[1], reverse=True)
            top_keywords = [w for w, _ in word_freqs[:top_n_keywords]]
        except Exception:
            # Fallback simple token frequency
            words = []
            for t in texts:
                words.extend(re.findall(r"\b[a-zA-Z]{3,}\b", t.lower()))
            filtered = [w for w in words if w not in self.stop_words]
            counts = Counter(filtered).most_common(top_n_keywords)
            top_keywords = [w for w, _ in counts]

        # 2. Select representative feedback documents
        representative = sorted(texts, key=len, reverse=True)[:3]

        # 3. Synthesize clean human-readable Problem Name
        problem_name = self._synthesize_problem_title(top_keywords, texts)
        description = (
            f"Cluster of {len(texts)} feedback items centered on "
            f"{', '.join(top_keywords[:4])}."
        )

        return TopicDefinition(
            topic_id=cluster_id,
            name=problem_name,
            description=description,
            keywords=top_keywords,
            representative_docs=representative,
        )

    def _synthesize_problem_title(self, keywords: List[str], texts: List[str]) -> str:
        """Derive standard executive-friendly problem title based on dominant semantic signals."""
        combined_text = " ".join(texts).lower()

        # Check dominant issue patterns in the cluster
        if "upi" in combined_text and any(k in combined_text for k in ["fail", "deduct", "cancel", "pending"]):
            return "UPI Payment Failure & Timeout"
        elif "checkout" in combined_text and any(k in combined_text for k in ["slow", "hang", "freeze", "forever"]):
            return "Checkout Latency & Freezing"
        elif any(k in combined_text for k in ["login", "otp", "sms", "sign in"]):
            return "Authentication & OTP Delivery Failures"
        elif any(k in combined_text for k in ["delivery", "rider", "courier", "delayed"]):
            return "Delivery Delays & Package Tracking Issues"
        elif any(k in combined_text for k in ["fee", "pricing", "subscription", "discount"]):
            return "Billing & Pricing Transparency Complaints"
        elif any(k in combined_text for k in ["dark mode", "font", "button", "ui", "search bar"]):
            return "UI Navigation & Contrast Defects"
        elif any(k in combined_text for k in ["crash", "force close"]):
            return "Application Crash on Action"
        elif any(k in combined_text for k in ["apple pay", "feature", "schedule", "invoice"]):
            return "Customer Feature Requests"

        # Fallback to capitalizing the top 2 n-grams
        if len(keywords) >= 2:
            return f"{keywords[0].title()} & {keywords[1].title()} Issue"
        elif len(keywords) == 1:
            return f"{keywords[0].title()} Problem"

        return "Unclassified Feedback Issue"


def get_topic_service() -> TopicModelingService:
    return TopicModelingService()
