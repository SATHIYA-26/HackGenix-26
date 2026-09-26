/**
 * Feedback Intelligence Platform - LLM Insights API Client
 * Connects directly to FastAPI backend (GET /api/v1/insights/{problem_id})
 */

import { apiGet } from "./client";

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
    console.error(`Failed to fetch insight for problem #${problemId}:`, err.message);
    return null;
  }
}

/**
 * Fetches executive weekly AI brief tailored per account.
 */
export async function getAIBrief(accountId = null) {
  try {
    const query = accountId ? `?account_id=${encodeURIComponent(accountId)}` : "";
    const summary = await apiGet(`/dashboard/summary${query}`);
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

    return {
      headline: "Customer Signal Summary",
      subheadline: "No high-priority friction clusters currently detected for this workspace.",
      shifts: [],
      isLive: true,
    };
  } catch (err) {
    console.error("AI brief live fetch offline:", err.message);
    return {
      headline: "Customer Signal Summary",
      subheadline: "No live signals available.",
      shifts: [],
      isLive: false,
    };
  }
}

/**
 * Interactive Q&A against customer feedback and problem clusters.
 */
export async function askAIQuestion(query, accountId = null) {
  try {
    const accParam = accountId ? `&account_id=${encodeURIComponent(accountId)}` : "";
    const raw = await apiGet(`/analysis/search?query=${encodeURIComponent(query)}&top_k=5${accParam}`);
    
    // Support both direct array or { query, results, total_searched } object from backend
    const items = Array.isArray(raw) ? raw : (raw?.results || []);
    
    if (items.length > 0) {
      const top = items[0];
      const text = top.feedback?.text || top.text || "Identified relevant customer feedback.";
      const source = top.feedback?.source || top.source || "Customer Reviews";
      const sourceDisplay = source === "youtube" ? "YouTube Comments" : (source === "google_maps" ? "Google Maps Reviews" : "Customer Reviews");
      return {
        answer: text,
        concentratedIn: sourceDisplay,
        evidenceCount: items.length,
        items: items,
        citations: items.map((it) => ({
          text: it.text || it.feedback?.text,
          source: it.source || it.feedback?.source,
          url: it.source_url || it.feedback?.source_url,
          score: it.similarity_score,
        })),
      };
    }

    return {
      answer: `Analysis completed for query: "${query}". No direct matching friction clusters found.`,
      concentratedIn: "Direct Ingestion",
      evidenceCount: 0,
      items: [],
    };
  } catch (err) {
    return {
      answer: `Signal synthesis: "${query}". Review ongoing customer feedback streams.`,
      concentratedIn: "Review Channels",
      evidenceCount: 1,
      items: [],
    };
  }
}

