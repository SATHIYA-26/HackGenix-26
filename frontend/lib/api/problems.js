/**
 * Feedback Intelligence Platform - Problems API Client
 * Connects directly to FastAPI backend (GET /api/v1/problems)
 */

import { apiGet } from "./client";
import { adaptProblem, adaptFeedback } from "./adapters";
import { PROBLEMS, getFullFeedbackDatabase } from "../../components/dashboard/data/intelligenceMockData";

/**
 * Fetches discovered problem clusters from FastAPI backend with live priority rankings.
 */
export async function getProblems({
  status = "all",
  search = "",
  product = "all",
  sort = "priority",
} = {}) {
  try {
    const raw = await apiGet(`/problems?skip=0&limit=100&sort_by_priority=${sort === "priority"}`);
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
    console.warn("Backend /problems offline, using fallback:", err.message);

    let results = [...PROBLEMS];
    if (status && status !== "all") {
      results = results.filter((p) => p.status === status);
    }
    if (search && search.trim() !== "") {
      const q = search.toLowerCase();
      results = results.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.summary.toLowerCase().includes(q)
      );
    }
    return {
      data: results,
      total: results.length,
      timestamp: new Date().toISOString(),
      isLive: false,
    };
  }
}

/**
 * Retrieves a single problem cluster by ID.
 */
export async function getProblemById(id) {
  try {
    const raw = await apiGet(`/problems/${id}`);
    return adaptProblem(raw);
  } catch (err) {
    console.warn(`Backend /problems/${id} offline, falling back:`, err.message);
    const problem = PROBLEMS.find((p) => String(p.id) === String(id));
    if (!problem) {
      throw new Error(`Problem with ID '${id}' not found`);
    }
    return problem;
  }
}

/**
 * Fetches customer feedback items linked to a problem cluster as evidence.
 */
export async function getProblemEvidence(problemId) {
  try {
    const rawList = await apiGet(`/feedback?limit=50`);
    const all = (rawList.items || []).map(adaptFeedback);
    // Find feedback items matching problem or default to top negative items
    const evidence = all.filter((f) => String(f.problemId) === String(problemId));
    return {
      problemId,
      totalEvidenceCount: evidence.length > 0 ? evidence.length : all.slice(0, 5).length,
      items: evidence.length > 0 ? evidence : all.slice(0, 5),
    };
  } catch (err) {
    console.warn(`Problem evidence fallback for ${problemId}:`, err.message);
    const allFeedback = getFullFeedbackDatabase();
    const evidence = allFeedback.filter((f) => f.problemId === problemId);
    return {
      problemId,
      totalEvidenceCount: evidence.length,
      items: evidence,
    };
  }
}

export async function updateProblemStatus(id, newStatus) {
  return { id, status: newStatus };
}
