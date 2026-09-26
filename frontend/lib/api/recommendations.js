/**
 * Feedback Intelligence Platform - Recommendations API Client
 * Connects directly to FastAPI backend (GET /api/v1/recommendations)
 */

import { apiGet, apiPost } from "./client";
import { adaptRecommendation } from "./adapters";

/**
 * Retrieves actionable domain engineering recommendations generated from problem clusters.
 * @param {string} [accountId] - Account ID filter
 */
export async function getRecommendations(accountId = null) {
  try {
    const accParam = accountId ? `&account_id=${encodeURIComponent(accountId)}` : "";
    const raw = await apiGet(`/recommendations?skip=0&limit=50${accParam}`);
    const items = (Array.isArray(raw) ? raw : []).map(adaptRecommendation);
    return {
      data: items,
      total: items.length,
      isLive: true,
    };
  } catch (err) {
    console.error("Failed to fetch recommendations from backend:", err.message);
    return {
      data: [],
      total: 0,
      isLive: false,
      error: err.message,
    };
  }
}

export async function getRecommendationById(id) {
  const { data } = await getRecommendations();
  const rec = data.find((r) => String(r.id) === String(id));
  if (!rec) {
    throw new Error(`Recommendation '${id}' not found`);
  }
  return rec;
}

/**
 * Converts an AI recommendation into an executable closed-loop Action via FastAPI.
 */
export async function createActionFromRecommendation(recId, payload = {}) {
  try {
    const action = await apiPost(
      `/actions/from-recommendation/${recId}?title=${encodeURIComponent(payload.title || "")}&assignee=${encodeURIComponent(payload.owner || "Product Engineering Team")}`
    );
    return action;
  } catch (err) {
    console.error(`Failed to promote recommendation ${recId} to action:`, err.message);
    throw err;
  }
}
