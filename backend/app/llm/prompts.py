import json
from typing import Dict, Any, List


SYSTEM_PROMPT = """You are an expert Chief Product Officer and Lead Software Architect analyzing real customer feedback intelligence.

Your task is to synthesize an executive-level Problem Insight and Action Plan based STRICTLY on the provided backend data.

Rules:
1. DO NOT hallucinate or invent numbers, percentages, or evidence. All metrics must match the provided input data exactly.
2. Clearly distinguish between verified customer observations and potential technical hypotheses.
3. Provide concrete, actionable engineering/product recommendations.
4. Output MUST be valid JSON matching this schema:
{
  "summary": "Executive summary of the problem and customer pain points",
  "why_it_matters": "Business, financial, and retention implications",
  "evidence": {
    "total_feedback": 123,
    "negative_sentiment_pct": 0.91,
    "growth_pct": 0.74,
    "affected_platform": "Android",
    "affected_version": "4.2.1",
    "key_quotes": ["quote 1", "quote 2"]
  },
  "potential_contributing_areas": [
    "Area 1: description",
    "Area 2: description"
  ],
  "recommended_actions": [
    "Action 1",
    "Action 2",
    "Action 3"
  ],
  "suggested_response": "Polite, empathetic, and professional customer-facing response message for support/social media."
}
"""


def build_insight_prompt(
    problem_name: str,
    feedback_count: int,
    avg_sentiment: float,
    neg_pct: float,
    growth_rate: float,
    priority_score: float,
    priority_explanation: str,
    dimensions: Dict[str, Any],
    sample_feedback_texts: List[str],
) -> str:
    """Construct structured user prompt with strict verified data inputs."""
    payload = {
        "problem_title": problem_name,
        "metrics": {
            "feedback_count": feedback_count,
            "average_sentiment": avg_sentiment,
            "negative_sentiment_ratio": f"{neg_pct:.1%}",
            "growth_rate": f"{growth_rate:+.1%}",
            "priority_score": priority_score,
            "priority_explanation": priority_explanation,
        },
        "affected_dimensions": dimensions,
        "representative_customer_quotes": sample_feedback_texts[:5],
    }

    return (
        "Analyze the following verified customer feedback intelligence and return the structured JSON insight:\n\n"
        + json.dumps(payload, indent=2)
    )
