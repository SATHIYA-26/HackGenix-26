import { PROBLEMS, CONNECTED_SOURCES, PRODUCT_TAXONOMY, getFullFeedbackDatabase } from "../../components/dashboard/data/intelligenceMockData";

/**
 * Dashboard API Client
 * High-level executive metrics, custom dashboard definitions, & taxonomy
 */
export async function getExecutiveDashboardMetrics() {
  await new Promise((resolve) => setTimeout(resolve, 50));
  const allFeedback = getFullFeedbackDatabase();
  const emergingCount = PROBLEMS.filter((p) => p.status === "emerging").length;
  const criticalCount = PROBLEMS.filter((p) => p.status === "critical").length;

  return {
    totalFeedback: 12482,
    negativeShiftPercent: -4.2,
    activeProblemsCount: PROBLEMS.length,
    criticalProblemsCount: criticalCount,
    emergingSignalsCount: emergingCount,
    topSources: CONNECTED_SOURCES.map((s) => ({
      name: s.name,
      count: s.itemsCount,
      type: s.type,
    })),
  };
}

export async function getTaxonomy() {
  await new Promise((resolve) => setTimeout(resolve, 40));
  return PRODUCT_TAXONOMY;
}
