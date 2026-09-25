from typing import Any, Dict, Optional
from fastapi import HTTPException, status


class FeedbackIntelligenceException(Exception):
    """Base exception for all domain errors."""
    def __init__(self, message: str, details: Optional[Dict[str, Any]] = None):
        super().__init__(message)
        self.message = message
        self.details = details or {}


class ResourceNotFoundException(FeedbackIntelligenceException):
    """Raised when an entity is not found."""
    pass


class DuplicateFeedbackException(FeedbackIntelligenceException):
    """Raised when duplicate feedback is detected."""
    pass


class ValidationError(FeedbackIntelligenceException):
    """Raised when validation fails."""
    pass


class ModelInferenceError(FeedbackIntelligenceException):
    """Raised when an NLP or ML model fails during inference."""
    pass


class DatabaseError(FeedbackIntelligenceException):
    """Raised when a database operation fails."""
    pass


class LLMServiceError(FeedbackIntelligenceException):
    """Raised when LLM service interaction fails."""
    pass


# Convenience aliases
EntityNotFoundException = ResourceNotFoundException
ValidationException = ValidationError
