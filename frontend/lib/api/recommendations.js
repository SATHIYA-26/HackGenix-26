/**
 * Feedback Intelligence Platform - Recommendations API Client
 * Connects directly to FastAPI backend (GET /api/v1/recommendations)
 */

import { apiGet, apiPost } from "./client";
import { adaptRecommendation } from "./adapters";
import { RECOMMENDATIONS } from "../../components/dashboard/data/intelligenceMockData";

/**
 * Retrieves actionable domain engineering recommendations generated from problem clusters.
 */
export async function getRecommendations() {
  try {
    const raw = await apiGet("/recommendations?skip=0&limit=50");
    const items = (Array.isArray(raw) ? raw : []).map(adaptRecommendation);
    return {
      data: items,
      total: items.length,
      isLive: true,
    };
  } catch (err) {
    console.warn("Backend /recommendations offline, using fallback:", err.message);
    return {
      data: [...RECOMMENDATIONS],
      total: RECOMMENDATIONS.length,
      isLive: false,
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
 * Converts an AI recommendation into an executable closed-loop Action.
 */
export async function createActionFromRecommendation(recId, payload = {}) {
  try {
    const action = await apiPost(`/actions/from-recommendation/${recId}`, {
      title: payload.title || undefined,
      owner: payload.owner || "Product Engineering Team",
    });
    return action;
  } catch (err) {
    console.warn(`Action creation fallback for rec ${recId}:`, err.message);
    return {
      id: `act-${Date.now()}`,
      recommendation_id: recId,
      title: payload.title || "Remediation Action",
      status: "in_progress",
      owner: payload.owner || "Engineering Team",
    };
  }
}
