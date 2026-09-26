/**
 * Feedback Intelligence Platform - Executive Dashboard API Client
 * Connects directly to FastAPI backend (GET /api/v1/dashboard/summary)
 */

import { apiGet } from "./client";
import { adaptDashboardSummary } from "./adapters";

/**
 * Fetches real-time executive dashboard metrics from FastAPI backend.
 * @param {string} [accountId] - Account/company ID (e.g. "acc_manis", "acc_chepauk", "acc_spotify", "acc_vj_sidhu")
 * @returns {Promise<any>} Normalized dashboard summary metrics
 */
export async function getExecutiveDashboardMetrics(accountId = null) {
  try {
    const query = accountId ? `?account_id=${encodeURIComponent(accountId)}` : "";
    const rawSummary = await apiGet(`/dashboard/summary${query}`);
    const adapted = adaptDashboardSummary(rawSummary);

    const criticalCount = (adapted.topProblems || []).filter((p) => p.status === "critical").length;

    return {
      totalFeedback: adapted.totalFeedback,
      analyzedFeedback: adapted.analyzedFeedback,
      avgSentimentScore: adapted.avgSentimentScore,
      negativeShiftPercent: Math.round(adapted.avgSentimentScore * 100) / 10,
      activeProblemsCount: adapted.totalProblems,
      criticalProblemsCount: criticalCount,
      emergingSignalsCount: adapted.emergingCount,
      sentimentDistribution: adapted.sentimentDistribution,
      intentDistribution: adapted.intentDistribution,
      sourceDistribution: adapted.sourceDistribution,
      topProblems: adapted.topProblems,
      emergingTrends: adapted.emergingTrends,
      topSources: Object.entries(adapted.sourceDistribution).map(([name, count]) => ({
        name: name.replace("_", " ").toUpperCase(),
        count: count,
        type: name,
      })),
      isLive: true,
    };
  } catch (err) {
    console.error("Failed to fetch dashboard summary from backend:", err.message);
    return {
      totalFeedback: 0,
      analyzedFeedback: 0,
      avgSentimentScore: 0,
      negativeShiftPercent: 0,
      activeProblemsCount: 0,
      criticalProblemsCount: 0,
      emergingSignalsCount: 0,
      sentimentDistribution: { positive: 0, neutral: 0, negative: 0 },
      intentDistribution: {},
      sourceDistribution: {},
      topProblems: [],
      emergingTrends: [],
      topSources: [],
      isLive: false,
      error: err.message,
    };
  }
}
