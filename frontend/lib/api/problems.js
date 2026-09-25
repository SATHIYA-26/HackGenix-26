import { PROBLEMS, getFullFeedbackDatabase } from "../../components/dashboard/data/intelligenceMockData";

/**
 * Problems API Client
 * Designed for seamless swap to FastAPI backend endpoints: GET /api/v1/problems
 */
export async function getProblems({ status = "all", search = "", product = "all", sort = "priority" } = {}) {
  // Simulate network latency for realistic SaaS feel
  await new Promise((resolve) => setTimeout(resolve, 80));

  let results = [...PROBLEMS];

  if (status && status !== "all") {
    results = results.filter((p) => p.status === status);
  }

  if (product && product !== "all") {
    results = results.filter((p) => p.product.toLowerCase().includes(product.toLowerCase()));
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
  };
}

export async function getProblemById(id) {
  await new Promise((resolve) => setTimeout(resolve, 50));
  const problem = PROBLEMS.find((p) => p.id === id);
  if (!problem) {
    throw new Error(`Problem with ID '${id}' not found`);
  }
  return problem;
}

export async function getProblemEvidence(problemId) {
  await new Promise((resolve) => setTimeout(resolve, 100));
  const allFeedback = getFullFeedbackDatabase();
  const evidence = allFeedback.filter((f) => f.problemId === problemId);
  return {
    problemId,
    totalEvidenceCount: evidence.length,
    items: evidence,
  };
}

export async function updateProblemStatus(id, newStatus) {
  await new Promise((resolve) => setTimeout(resolve, 150));
  const problem = PROBLEMS.find((p) => p.id === id);
  if (problem) {
    problem.status = newStatus;
  }
  return problem;
}
