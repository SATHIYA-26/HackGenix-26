import { ACTIONS } from "../../components/dashboard/data/intelligenceMockData";

/**
 * Actions API Client
 * Designed for closing the feedback loop & post-fix monitoring: GET /api/v1/actions
 */
export async function getActions() {
  await new Promise((resolve) => setTimeout(resolve, 60));
  return {
    data: [...ACTIONS],
    total: ACTIONS.length,
  };
}

export async function createAction(actionData) {
  await new Promise((resolve) => setTimeout(resolve, 120));
  const newAction = {
    id: `act-${Date.now()}`,
    title: actionData.title,
    problemId: actionData.problemId,
    problemName: actionData.problemName,
    owner: actionData.owner || "Product Engineering",
    status: actionData.status || "planned",
    statusLabel: actionData.statusLabel || "Planned",
    startedDate: new Date().toISOString().split("T")[0],
    targetDate: actionData.targetDate || "2026-10-20",
    baselineWeeklyComplaints: actionData.baselineWeeklyComplaints || 100,
    currentWeeklyComplaints: actionData.currentWeeklyComplaints || 100,
    resolvedImpactPercent: 0,
    impactNote: actionData.impactNote || "Roadmap action created.",
  };
  ACTIONS.unshift(newAction);
  return newAction;
}

export async function updateActionStatus(actionId, newStatus) {
  await new Promise((resolve) => setTimeout(resolve, 100));
  const item = ACTIONS.find((a) => a.id === actionId);
  if (item) {
    item.status = newStatus;
  }
  return item;
}

export async function getPostFixMonitoring(actionId) {
  await new Promise((resolve) => setTimeout(resolve, 60));
  const action = ACTIONS.find((a) => a.id === actionId);
  if (!action) return null;

  return {
    actionId,
    problemName: action.problemName,
    beforeCount: action.baselineWeeklyComplaints,
    afterCount: action.currentWeeklyComplaints,
    reductionPercent: action.resolvedImpactPercent,
    observedNote:
      "Statistically validated trend drop observed across connected channels post-deployment.",
  };
}
