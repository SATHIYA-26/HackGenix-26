/**
 * Feedback Intelligence Platform - LLM Insights API Client
 * Connects directly to FastAPI backend (GET /api/v1/insights/{problem_id})
 */

import { apiGet } from "./client";
import { adaptFeedback } from "./adapters";
import { AI_BRIEF, PROBLEMS, getFullFeedbackDatabase } from "../../components/dashboard/data/intelligenceMockData";

/**
 * Fetches executive LLM insight synthesis for a specific problem cluster.
 */
export async function getProblemInsight(problemId) {
  try {
    const raw = await apiGet(`/insights/${problemId}`);
    return {
      id: raw.id,
      problemId: String(raw.problem_id),
      problemName: raw.problem_name,
      summary: raw.summary,
      whyItMatters: raw.why_it_matters,
      evidence: raw.evidence || {},
      recommendedActions: raw.recommended_actions || [],
      suggestedResponse: raw.suggested_response,
      createdAt: raw.created_at,
      isLive: true,
    };
  } catch (err) {
    console.warn(`Problem insight fallback for ${problemId}:`, err.message);
    return null;
  }
}

/**
 * Fetches executive weekly AI brief.
 */
export async function getAIBrief() {
  try {
    const summary = await apiGet("/dashboard/summary");
    const top = summary.top_priority_problems || [];

    if (top.length > 0) {
      return {
        headline: "Customer Signal Summary",
        subheadline: `${top.length} high-priority customer friction clusters identified across ${summary.total_feedback || 0} signals:`,
        shifts: top.slice(0, 3).map((p, idx) => ({
          id: `shift-${idx + 1}`,
          number: `0${idx + 1}`,
          text: p.description || p.name,
          category: p.growth_rate > 0.4 ? "Emerging Surge" : "Priority Issue",
          problemId: String(p.id),
          impact: p.priority_score > 0.8 ? "Critical User Friction" : "Active Problem",
          sentiment: `${Math.round(Math.abs(p.average_sentiment || -0.8) * 100)}% Negative`,
        })),
        isLive: true,
      };
    }
  } catch (err) {
    console.warn("AI brief live fetch offline, using fallback:", err.message);
  }
  return AI_BRIEF;
}

/**
 * Semantic grounded AI question answering.
 */
export async function askAIQuestion(query) {
  try {
    // 1. Semantic search across pgvector feedback
    const searchRes = await apiGet(`/analysis/search?query=${encodeURIComponent(query)}&limit=5`);
    const hits = (searchRes.results || []).map((r) => adaptFeedback(r.feedback));

    if (hits.length > 0) {
      const topHit = hits[0];
      return {
        answer: `Identified relevant customer signals matching "${query}". Top complaint cites: "${topHit.text}". Identified intent: ${topHit.intent} with ${topHit.sentiment} sentiment.`,
        problemId: topHit.problemId || "1",
        problemName: topHit.problemName || "Semantic Search Match",
        evidenceCount: hits.length,
        negativeSentiment: "88%",
        concentratedIn: `${topHit.source.toUpperCase()} (${topHit.platform})`,
        recommendedAction: "Review related feedback cluster and deploy targeted mitigation.",
        citations: hits.slice(0, 3),
        isLive: true,
      };
    }
  } catch (err) {
    console.warn("Ask AI live semantic search offline, using local response:", err.message);
  }

  const q = query.toLowerCase();
  if (q.includes("payment") || q.includes("upi") || q.includes("checkout")) {
    const upiProblem = PROBLEMS.find((p) => p.id === "prob-1");
    const evidence = getFullFeedbackDatabase().filter((f) => f.problemId === "prob-1");
    return {
      answer: `UPI payment failures increased 74% this week, with 127 total related customer feedback items identified. 91% of feedback expresses severe negative sentiment.`,
      problemId: "prob-1",
      problemName: upiProblem.name,
      evidenceCount: evidence.length,
      negativeSentiment: "91%",
      concentratedIn: "Android v4.2.1 (Checkout)",
      recommendedAction: "Audit Razorpay/Juspay webhook idempotency handler and deploy graceful retry banner.",
      citations: evidence.slice(0, 3),
      isLive: false,
    };
  }

  return {
    answer: `Analysis across customer feedback indicates that stability and core journeys represent the highest priority friction clusters this week.`,
    problemId: "prob-1",
    problemName: "General Feedback Intelligence Synthesis",
    evidenceCount: 120,
    negativeSentiment: "64%",
    concentratedIn: "Cross-platform ecosystem",
    recommendedAction: "Focus on checkout reliability to protect core product metrics.",
    citations: getFullFeedbackDatabase().slice(0, 2),
    isLive: false,
  };
}
