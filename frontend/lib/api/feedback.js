/**
 * Feedback Intelligence Platform - Feedback Explorer API Client
 * Connects directly to FastAPI backend (GET /api/v1/feedback & /api/v1/analysis/search)
 */

import { apiGet } from "./client";
import { adaptFeedback } from "./adapters";

/**
 * Retrieves paginated feedback items with live NLP analysis, source, and sentiment filters.
 */
export async function getFeedbackList({
  accountId = null,
  page = 1,
  limit = 25,
  problemId = null,
  source = "all",
  sentiment = "all",
  intent = "all",
  search = "",
} = {}) {
  try {
    // If semantic search query is entered, check /analysis/search first
    if (search && search.trim().length > 3) {
      try {
        const searchResults = await apiGet(`/analysis/search?query=${encodeURIComponent(search.trim())}&limit=${limit}`);
        if (Array.isArray(searchResults) && searchResults.length > 0) {
          let items = searchResults.map((r) => {
            const fb = adaptFeedback(r.feedback || r);
            fb.similarityScore = r.similarity_score;
            return fb;
          });

          if (accountId) {
            items = items.filter((f) => !f.metadata?.account_id || f.metadata?.account_id === accountId);
          }

          return {
            data: items,
            page: 1,
            limit,
            total: items.length,
            totalPages: 1,
            isLive: true,
            isSemanticSearch: true,
          };
        }
      } catch (searchErr) {
        console.warn("Semantic search failed, falling back to standard filter:", searchErr.message);
      }
    }

    const params = new URLSearchParams();
    params.set("page", String(page));
    params.set("limit", String(limit));

    if (accountId) {
      params.set("account_id", accountId);
    }
    if (source && source !== "all") {
      params.set("source", source.toLowerCase());
    }
    if (sentiment && sentiment !== "all") {
      params.set("sentiment", sentiment.toLowerCase());
    }
    if (intent && intent !== "all") {
      params.set("intent", intent.toLowerCase());
    }

    const raw = await apiGet(`/feedback?${params.toString()}`);
    let items = (raw.items || []).map(adaptFeedback);

    // Apply text filter if needed
    if (search && search.trim() !== "") {
      const q = search.toLowerCase();
      items = items.filter(
        (f) =>
          f.text.toLowerCase().includes(q) ||
          f.authorName.toLowerCase().includes(q) ||
          f.intent.toLowerCase().includes(q)
      );
    }

    const total = raw.total || items.length;

    return {
      data: items,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
      isLive: true,
    };
  } catch (err) {
    console.error("Failed to fetch feedback from backend:", err.message);
    return {
      data: [],
      page,
      limit,
      total: 0,
      totalPages: 0,
      isLive: false,
      error: err.message,
    };
  }
}

/**
 * Retrieves a single feedback item and its full NLP analysis.
 */
export async function getFeedbackById(id) {
  try {
    const raw = await apiGet(`/feedback/${id}`);
    return adaptFeedback(raw);
  } catch (err) {
    console.error(`Failed to fetch feedback item '${id}' from backend:`, err.message);
    throw err;
  }
}
