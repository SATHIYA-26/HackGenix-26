from typing import Dict, List, Optional, Any
from collections import Counter
import re

from app.db.models import Feedback


class DimensionExtractor:
    """Extracts platform, product, feature, version, and issue dimensions
    from feedback metadata and texts without hallucination.
    """

    def extract_dimensions_for_cluster(self, feedback_items: List[Feedback]) -> Dict[str, Any]:
        """Aggregate dimensions across all feedback items linked to a problem cluster."""
        if not feedback_items:
            return {
                "product": None,
                "feature": None,
                "issue": None,
                "platform": None,
                "version": None,
                "platform_distribution": {},
                "version_distribution": {},
            }

        platforms: List[str] = []
        versions: List[str] = []
        products: List[str] = []
        features: List[str] = []

        for item in feedback_items:
            meta = item.extra_metadata or {}

            # 1. Check explicit metadata
            if meta.get("platform"):
                platforms.append(str(meta["platform"]).lower())
            if meta.get("version"):
                versions.append(str(meta["version"]))
            if meta.get("product"):
                products.append(str(meta["product"]))
            if meta.get("feature"):
                features.append(str(meta["feature"]).lower())

            # 2. Extract from text if not in metadata
            text_lower = item.text.lower()
            if not meta.get("platform"):
                if "android" in text_lower:
                    platforms.append("android")
                elif "ios" in text_lower or "iphone" in text_lower or "ipad" in text_lower:
                    platforms.append("ios")
                elif "web" in text_lower or "browser" in text_lower:
                    platforms.append("web")

            if not meta.get("version"):
                # Detect semantic version patterns like v4.2.1 or 4.2.0
                ver_match = re.search(r"\bv?(\d+\.\d+(\.\d+)?)\b", text_lower)
                if ver_match:
                    versions.append(ver_match.group(1))

        # Find most dominant values
        top_platform = Counter(platforms).most_common(1)[0][0] if platforms else None
        top_version = Counter(versions).most_common(1)[0][0] if versions else None
        top_product = Counter(products).most_common(1)[0][0] if products else "mobile_app"
        top_feature = Counter(features).most_common(1)[0][0] if features else None

        return {
            "product": top_product,
            "feature": top_feature,
            "platform": top_platform,
            "version": top_version,
            "platform_distribution": dict(Counter(platforms)),
            "version_distribution": dict(Counter(versions)),
        }


dimension_extractor = DimensionExtractor()
