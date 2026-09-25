from typing import List, Dict, Any, Tuple, Optional
import numpy as np
import hdbscan

from app.core.logging import logger


class ClusterResult:
    def __init__(
        self,
        cluster_id: int,
        feedback_ids: List[str],
        texts: List[str],
        centroid: Optional[List[float]] = None,
    ):
        self.cluster_id = cluster_id
        self.feedback_ids = feedback_ids
        self.texts = texts
        self.centroid = centroid or []
        self.size = len(feedback_ids)


class SemanticClusteringService:
    """HDBSCAN-based density clustering for high-dimensional semantic embeddings.
    
    Identifies natural density clusters and separates unstructured noise/outliers (cluster -1).
    """

    def __init__(
        self,
        min_cluster_size: int = 5,
        min_samples: int = 3,
        metric: str = "euclidean",
    ):
        self.min_cluster_size = min_cluster_size
        self.min_samples = min_samples
        self.metric = metric

    def fit_predict(
        self,
        embeddings: List[List[float]],
        feedback_ids: List[str],
        texts: List[str],
    ) -> Tuple[Dict[int, ClusterResult], List[str]]:
        """Run HDBSCAN clustering on embeddings.
        
        Returns:
            Tuple of:
            - Dict mapping cluster_id -> ClusterResult for all valid clusters (id >= 0)
            - List of outlier/noise feedback_ids (id == -1)
        """
        if len(embeddings) < self.min_cluster_size:
            logger.info(f"Insufficient feedback ({len(embeddings)}) for HDBSCAN clustering. Min required: {self.min_cluster_size}")
            # If too few items to cluster, treat all as unclustered/noise
            return {}, feedback_ids

        # Ensure numpy array float32
        X = np.array(embeddings, dtype=np.float32)

        try:
            clusterer = hdbscan.HDBSCAN(
                min_cluster_size=max(2, min(self.min_cluster_size, 3)),
                min_samples=min(2, self.min_samples),
                metric=self.metric,
                cluster_selection_epsilon=0.4,
                allow_single_cluster=True,
            )
            labels = clusterer.fit_predict(X)
        except Exception as exc:
            logger.error(f"HDBSCAN clustering failed: {exc}. Falling back to cosine distance partitioning.")
            # Fallback partitioning
            labels = self._fallback_clustering(X)

        # If HDBSCAN produced 0 clusters (all marked as -1 noise), engage density fallback
        if len([l for l in set(labels) if l >= 0]) == 0 and len(embeddings) >= self.min_cluster_size:
            logger.info("HDBSCAN yielded 0 clusters for small batch; engaging semantic similarity fallback.")
            labels = self._fallback_clustering(X, threshold=0.50)

        clusters: Dict[int, ClusterResult] = {}
        outlier_feedback_ids: List[str] = []

        unique_labels = set(labels)
        logger.info(f"Discovered {len([l for l in unique_labels if l >= 0])} distinct clusters from {len(embeddings)} items.")

        for label in unique_labels:
            indices = np.where(labels == label)[0]
            cluster_f_ids = [feedback_ids[i] for i in indices]
            cluster_texts = [texts[i] for i in indices]

            if label == -1:
                # HDBSCAN noise / outlier points
                outlier_feedback_ids.extend(cluster_f_ids)
            else:
                cluster_embs = X[indices]
                centroid = np.mean(cluster_embs, axis=0).tolist()
                clusters[int(label)] = ClusterResult(
                    cluster_id=int(label),
                    feedback_ids=cluster_f_ids,
                    texts=cluster_texts,
                    centroid=centroid,
                )

        return clusters, outlier_feedback_ids

    def _fallback_clustering(self, X: np.ndarray, threshold: float = 0.65) -> np.ndarray:
        """Lightweight distance-based connected-components clustering as fallback."""
        n = len(X)
        labels = -1 * np.ones(n, dtype=int)
        current_cluster = 0

        for i in range(n):
            if labels[i] != -1:
                continue
            # Compare with all unassigned items
            similar_indices = [i]
            for j in range(i + 1, n):
                if labels[j] == -1:
                    sim = float(np.dot(X[i], X[j]) / (np.linalg.norm(X[i]) * np.linalg.norm(X[j]) + 1e-9))
                    if sim >= threshold:
                        similar_indices.append(j)

            if len(similar_indices) >= self.min_cluster_size:
                for idx in similar_indices:
                    labels[idx] = current_cluster
                current_cluster += 1

        return labels


def get_clustering_service() -> SemanticClusteringService:
    return SemanticClusteringService()
