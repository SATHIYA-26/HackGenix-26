import re
import unicodedata
from typing import List, Optional, Tuple, Dict, Set
from dataclasses import dataclass

import spacy
from app.core.logging import logger


@dataclass
class PreprocessedText:
    raw_text: str
    cleaned_text: str
    language: str
    is_noise: bool
    is_duplicate: bool
    duplicate_of: Optional[str] = None
    tokens: Optional[List[str]] = None


class TextPreprocessor:
    """Production text preprocessing pipeline.
    
    Validates, normalizes, detects language/noise, and flags exact or near-duplicates
    while strictly preserving sentiment context (emojis, negations, capitalization cues).
    """

    def __init__(self, spacy_model: str = "en_core_web_sm"):
        try:
            self.nlp = spacy.load(spacy_model, disable=["ner", "parser"])
            logger.info(f"Loaded spaCy model '{spacy_model}' for preprocessing.")
        except Exception as exc:
            logger.warning(f"Could not load spaCy model '{spacy_model}' ({exc}), using blank English.")
            self.nlp = spacy.blank("en")

        # Noise / spam token list
        self.noise_tokens = {
            "first", "nice", "ok", "k", "cool", "good", "yo", "hi", "hello",
            "check", "test", "testing", "12345", "asdf", "asdfghjk", "...",
            "👍", "❤️", "🔥", "lol", "lmao", "gg", "plz", "pls"
        }

        # Cache of normalized text hashes and tokens for near-deduplication within a session/batch
        self.seen_exact: Dict[str, str] = {}  # text_hash -> feedback_id
        self.seen_signatures: List[Tuple[str, Set[str]]] = []  # (feedback_id, token_set)

    def validate_text(self, text: Optional[str]) -> str:
        """Validate input text; raises ValueError if empty or whitespace only."""
        if not text or not text.strip():
            raise ValueError("Input feedback text cannot be empty or whitespace only.")
        return text.strip()

    def normalize(self, text: str) -> str:
        """Normalize unicode, clean redundant whitespace, but preserve emojis and negations."""
        # Normalize unicode (NFKC)
        text = unicodedata.normalize("NFKC", text)

        # Replace non-breaking spaces with regular spaces
        text = text.replace("\u00a0", " ").replace("\u200b", "")

        # Collapse 3+ repeated characters (e.g. 'sooooo bad' -> 'soo bad')
        text = re.sub(r"(.)\1{2,}", r"\1\1", text)

        # Collapse multiple whitespace
        text = re.sub(r"\s+", " ", text).strip()
        return text

    def detect_language(self, text: str) -> str:
        """Lightweight language detection defaulting to 'en' with non-latin detection."""
        # If text contains mostly non-Latin characters, flag appropriately
        latin_chars = sum(1 for c in text if 'a' <= c.lower() <= 'z')
        total_alpha = sum(1 for c in text if c.isalpha())

        if total_alpha > 0 and (latin_chars / total_alpha) < 0.4:
            return "unknown"
        return "en"

    def is_spam_or_noise(self, cleaned_text: str) -> bool:
        """Detect spam, low-effort comments, or low-information noise."""
        lowered = cleaned_text.lower().strip()

        # Extremely short or purely punctuation/digits
        if len(lowered) <= 2:
            return True

        if lowered in self.noise_tokens:
            return True

        # Non-alphanumeric only (e.g. "...", "???", "---")
        alpha_count = sum(1 for c in lowered if c.isalnum())
        if alpha_count == 0:
            return True

        # Repetitive single character (e.g. "aaaaa", "zzzzzz")
        unique_chars = set(c for c in lowered if c.isalnum())
        if len(unique_chars) == 1 and len(lowered) > 3:
            return True

        return False

    def _token_set(self, text: str) -> Set[str]:
        """Extract set of alphanumeric word tokens (length >= 3) for near-duplicate Jaccard similarity."""
        words = re.findall(r"\b[a-zA-Z0-9_-]{3,}\b", text.lower())
        return set(words)

    def check_duplicate(self, feedback_id: str, text: str, threshold: float = 0.70) -> Tuple[bool, Optional[str]]:
        """Check for exact or near duplicate against seen items in the current processing window."""
        normalized = text.lower().strip()

        # 1. Exact duplicate check
        if normalized in self.seen_exact:
            original_id = self.seen_exact[normalized]
            return True, original_id

        # 2. Near duplicate check using Jaccard and containment similarity of token sets
        tokens = self._token_set(normalized)
        if len(tokens) >= 3:
            for seen_id, seen_tokens in self.seen_signatures:
                intersection = len(tokens & seen_tokens)
                union = len(tokens | seen_tokens)
                min_len = min(len(tokens), len(seen_tokens))

                jaccard = (intersection / union) if union > 0 else 0.0
                containment = (intersection / min_len) if min_len > 0 else 0.0

                if jaccard >= threshold or containment >= 0.80:
                    return True, seen_id

        # Register as new seen item
        self.seen_exact[normalized] = feedback_id
        if len(tokens) >= 3:
            self.seen_signatures.append((feedback_id, tokens))

        return False, None

    def preprocess(
        self,
        feedback_id: str,
        text: str,
        check_dedup: bool = True,
    ) -> PreprocessedText:
        """Execute the full preprocessing pipeline on a single feedback item."""
        validated = self.validate_text(text)
        normalized = self.normalize(validated)
        language = self.detect_language(normalized)
        is_noise = self.is_spam_or_noise(normalized)

        is_dup = False
        dup_of = None
        if check_dedup and not is_noise:
            is_dup, dup_of = self.check_duplicate(feedback_id, normalized)

        # Tokenize with spaCy
        doc = self.nlp(normalized)
        tokens = [token.text for token in doc]

        return PreprocessedText(
            raw_text=text,
            cleaned_text=normalized,
            language=language,
            is_noise=is_noise,
            is_duplicate=is_dup,
            duplicate_of=dup_of,
            tokens=tokens,
        )

    def reset_dedup_cache(self) -> None:
        """Clear session deduplication cache."""
        self.seen_exact.clear()
        self.seen_signatures.clear()


# Global Singleton Preprocessor
text_preprocessor = TextPreprocessor()
