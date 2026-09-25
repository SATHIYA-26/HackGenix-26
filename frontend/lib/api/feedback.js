/**
 * Feedback Intelligence Platform - Feedback Explorer API Client
 * Connects directly to FastAPI backend (GET /api/v1/feedback)
 */

import { apiGet } from "./client";
import { adaptFeedback } from "./adapters";
import { getFullFeedbackDatabase } from "../../components/dashboard/data/intelligenceMockData";

/**
 * Retrieves paginated feedback items with live NLP analysis, source, and sentiment filters.
 */
export async function getFeedbackList({
  page = 1,
  limit = 25,
  problemId = null,
  source = "all",
  sentiment = "all",
  platform = "all",
  search = "",
} = {}) {
  try {
    const params = new URLSearchParams();
    params.set("page", String(page));
    params.set("limit", String(limit));

    if (source && source !== "all") {
      params.set("source", source.toLowerCase());
    }
    if (sentiment && sentiment !== "all") {
      params.set("sentiment", sentiment.toLowerCase());
    }

    const raw = await apiGet(`/feedback?${params.toString()}`);
    let items = (raw.items || []).map(adaptFeedback);

    // Apply client-side search or semantic search if text is entered
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
    console.warn("Backend /feedback offline, using fallback:", err.message);

    let all = getFullFeedbackDatabase();
    if (source && source !== "all") {
      all = all.filter((f) => f.source.toLowerCase() === source.toLowerCase());
    }
    if (sentiment && sentiment !== "all") {
      all = all.filter((f) => f.sentiment.toLowerCase() === sentiment.toLowerCase());
    }
    if (search && search.trim() !== "") {
      const q = search.toLowerCase();
      all = all.filter((f) => f.text.toLowerCase().includes(q));
    }

    const total = all.length;
    const start = (page - 1) * limit;
    const paginated = all.slice(start, start + limit);

    return {
      data: paginated,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      isLive: false,
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
    console.warn(`Backend /feedback/${id} offline:`, err.message);
    const all = getFullFeedbackDatabase();
    const item = all.find((f) => f.id === id);
    if (!item) {
      throw new Error(`Feedback item '${id}' not found`);
    }
    return item;
  }
}

/**
 * Semantic vector similarity search using BGE embeddings.
 */
export async function getSimilarFeedback(feedbackId) {
  try {
    const current = await getFeedbackById(feedbackId);
    if (!current) return [];

    const rawResults = await apiGet(`/analysis/search?query=${encodeURIComponent(current.text.slice(0, 80))}&limit=5`);
    return (rawResults.results || []).map((r) => adaptFeedback(r.feedback));
  } catch (err) {
    console.warn("Semantic similarity search fallback:", err.message);
    const all = getFullFeedbackDatabase();
    return all.slice(0, 4);
  }
}
