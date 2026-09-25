import { RECOMMENDATIONS, ACTIONS } from "../../components/dashboard/data/intelligenceMockData";

/**
 * Recommendations API Client
 * Designed for seamless swap to FastAPI backend endpoints: GET /api/v1/recommendations
 */
export async function getRecommendations() {
  await new Promise((resolve) => setTimeout(resolve, 60));
  return {
    data: [...RECOMMENDATIONS],
    total: RECOMMENDATIONS.length,
  };
}

export async function getRecommendationById(id) {
  await new Promise((resolve) => setTimeout(resolve, 50));
  const rec = RECOMMENDATIONS.find((r) => r.id === id);
  if (!rec) {
    throw new Error(`Recommendation '${id}' not found`);
  }
  return rec;
}

export async function createActionFromRecommendation(recId, payload) {
  await new Promise((resolve) => setTimeout(resolve, 150));
  const newAction = {
    id: `act-${Date.now()}`,
    title: payload.title,
    problemId: payload.problemId,
    problemName: payload.problemName,
    owner: payload.owner || "Product Core Team",
    status: "in_progress",
    statusLabel: "In Progress",
    startedDate: new Date().toISOString().split("T")[0],
    targetDate: payload.targetDate || "2026-10-15",
    baselineWeeklyComplaints: payload.baselineComplaints || 127,
    currentWeeklyComplaints: payload.baselineComplaints || 127,
    resolvedImpactPercent: 0,
    impactNote: "Action initiated from evidence-backed recommendation.",
  };
  ACTIONS.unshift(newAction);
  return newAction;
}
