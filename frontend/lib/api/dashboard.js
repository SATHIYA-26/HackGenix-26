/**
 * Feedback Intelligence Platform - Executive Dashboard API Client
 * Connects directly to FastAPI backend (GET /api/v1/dashboard/summary)
 */

import { apiGet } from "./client";
import { adaptDashboardSummary } from "./adapters";
import {
  PROBLEMS,
  CONNECTED_SOURCES,
  PRODUCT_TAXONOMY,
} from "../../components/dashboard/data/intelligenceMockData";

/**
 * Fetches real-time executive dashboard metrics from FastAPI backend.
 * Returns normalized metrics, top priority problems, emerging trends, and distributions.
 */
export async function getExecutiveDashboardMetrics() {
  try {
    const rawSummary = await apiGet("/dashboard/summary");
    const adapted = adaptDashboardSummary(rawSummary);

    const criticalCount = adapted.topProblems.filter((p) => p.status === "critical").length;

    return {
      totalFeedback: adapted.totalFeedback,
      analyzedFeedback: adapted.analyzedFeedback,
      negativeShiftPercent: Math.round(adapted.avgSentimentScore * 100) / 10,
      activeProblemsCount: adapted.totalProblems,
      criticalProblemsCount: criticalCount || Math.min(adapted.totalProblems, 3),
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
    console.warn("Backend /dashboard/summary offline, using fallback:", err.message);

    const emergingCount = PROBLEMS.filter((p) => p.status === "emerging").length;
    const criticalCount = PROBLEMS.filter((p) => p.status === "critical").length;

    return {
      totalFeedback: 12482,
      analyzedFeedback: 12482,
      negativeShiftPercent: -4.2,
      activeProblemsCount: PROBLEMS.length,
      criticalProblemsCount: criticalCount,
      emergingSignalsCount: emergingCount,
      sentimentDistribution: { positive: 4500, neutral: 3200, negative: 4782 },
      intentDistribution: {},
      sourceDistribution: {},
      topProblems: PROBLEMS.slice(0, 5),
      emergingTrends: [],
      topSources: CONNECTED_SOURCES.map((s) => ({
        name: s.name,
        count: s.itemsCount || 100,
        type: s.type,
      })),
      isLive: false,
    };
  }
}

export async function getTaxonomy() {
  return PRODUCT_TAXONOMY;
}
