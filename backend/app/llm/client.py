from typing import Optional, Dict, Any
from app.core.config import settings
from app.core.logging import logger
from app.core.exceptions import LLMServiceError


class LLMClient:
    """Configurable client for OpenAI-compatible LLM endpoints."""

    def __init__(self):
        self.api_key = settings.OPENAI_API_KEY
        self.base_url = settings.OPENAI_BASE_URL
        self.model = settings.LLM_MODEL
        self.temperature = settings.LLM_TEMPERATURE
        self.timeout = settings.LLM_TIMEOUT_SECONDS

        self.client = None
        if self.api_key and self.api_key.strip():
            try:
                from openai import OpenAI
                self.client = OpenAI(
                    api_key=self.api_key,
                    base_url=self.base_url,
                    timeout=self.timeout,
                )
                logger.info(f"OpenAI LLM client initialized for model '{self.model}'.")
            except Exception as exc:
                logger.warning(f"Could not initialize OpenAI client ({exc}). Will use fallback.")

    @property
    def is_available(self) -> bool:
        return self.client is not None and bool(self.api_key)

    def generate_chat_completion(self, system_prompt: str, user_prompt: str) -> str:
        """Call LLM with structured system and user prompts."""
        if not self.is_available:
            raise LLMServiceError("LLM API key is not configured or client unavailable.")

        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt},
                ],
                temperature=self.temperature,
                response_format={"type": "json_object"},
            )
            content = response.choices[0].message.content
            return content or "{}"
        except Exception as exc:
            logger.error(f"Error calling OpenAI API: {exc}")
            raise LLMServiceError(f"LLM API request failed: {exc}")
