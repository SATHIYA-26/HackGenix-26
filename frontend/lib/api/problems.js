/**
 * Feedback Intelligence Platform - Problems API Client
 * Connects directly to FastAPI backend (GET /api/v1/problems)
 */

import { apiGet } from "./client";
import { adaptProblem, adaptFeedback } from "./adapters";

/**
 * Fetches discovered problem clusters from FastAPI backend with live priority rankings.
 * @param {object} params
 * @param {string} [params.accountId] - Account filter
 * @param {string} [params.status] - Status filter (critical, emerging, etc.)
 * @param {string} [params.search] - Search text query
 * @param {string} [params.product] - Product category
 * @param {string} [params.sort] - Sort criteria ("priority", "growth", "volume")
 */
export async function getProblems({
  accountId = null,
  status = "all",
  search = "",
  product = "all",
  sort = "priority",
} = {}) {
  try {
    const accParam = accountId ? `&account_id=${encodeURIComponent(accountId)}` : "";
    const raw = await apiGet(`/problems?skip=0&limit=100&sort_by_priority=${sort === "priority"}${accParam}`);
    const items = raw.items || (Array.isArray(raw) ? raw : []);
    let results = items.map(adaptProblem);

    // Apply UI filters
    if (status && status !== "all") {
      results = results.filter((p) => p.status === status);
    }

    if (product && product !== "all") {
      results = results.filter((p) =>
        p.product.toLowerCase().includes(product.toLowerCase())
      );
    }

    if (search && search.trim() !== "") {
      const q = search.toLowerCase();
      results = results.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.summary.toLowerCase().includes(q) ||
          p.affectedArea.toLowerCase().includes(q)
      );
    }

    if (sort === "priority") {
      results.sort((a, b) => b.priorityScore - a.priorityScore);
    } else if (sort === "growth") {
      results.sort((a, b) => b.growthRate - a.growthRate);
    } else if (sort === "volume") {
      results.sort((a, b) => b.feedbackCount - a.feedbackCount);
    }

    return {
      data: results,
      total: results.length,
      timestamp: new Date().toISOString(),
      isLive: true,
    };
  } catch (err) {
    console.error("Failed to fetch problems from backend:", err.message);
    return {
      data: [],
      total: 0,
      timestamp: new Date().toISOString(),
      isLive: false,
      error: err.message,
    };
  }
}

/**
 * Retrieves a single problem cluster by ID with traceable quotes and evidence from FastAPI.
 */
export async function getProblemById(id) {
  try {
    const raw = await apiGet(`/problems/${id}`);
    const adapted = adaptProblem(raw);

    if (raw.representative_feedback) {
      adapted.representativeFeedback = raw.representative_feedback.map((f) => ({
        id: f.feedback_id,
        text: f.text,
        source: f.source,
        sourceUrl: f.source_url,
        rating: f.rating,
        sentiment: f.sentiment,
        createdAt: f.created_at,
      }));
    }

    if (raw.evidence_summary) {
      adapted.evidenceSummary = raw.evidence_summary;
    }

    if (raw.traceable_feedback_ids) {
      adapted.traceableFeedbackIds = raw.traceable_feedback_ids;
    }

    return adapted;
  } catch (err) {
    console.error(`Failed to fetch problem #${id} from backend:`, err.message);
    throw err;
  }
}

/**
 * Fetches customer feedback items linked to a problem cluster as evidence.
 */
export async function getProblemEvidence(problemId) {
  try {
    const detail = await getProblemById(problemId);
    if (detail && detail.representativeFeedback && detail.representativeFeedback.length > 0) {
      return {
        problemId,
        totalEvidenceCount: detail.representativeFeedback.length,
        items: detail.representativeFeedback,
      };
    }

    const rawList = await apiGet(`/feedback?limit=50`);
    const all = (rawList.items || []).map(adaptFeedback);
    const evidence = all.filter((f) => String(f.problemId) === String(problemId));
    return {
      problemId,
      totalEvidenceCount: evidence.length,
      items: evidence,
    };
  } catch (err) {
    console.error(`Failed to fetch evidence for problem ${problemId}:`, err.message);
    return {
      problemId,
      totalEvidenceCount: 0,
      items: [],
    };
  }
}

export async function updateProblemStatus(id, newStatus) {
  return { id, status: newStatus };
}
