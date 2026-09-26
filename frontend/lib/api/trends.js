/**
 * Feedback Intelligence Platform - Trends API Client
 * Connects directly to FastAPI backend (GET /api/v1/trends)
 */

import { apiGet } from "./client";
import { adaptTrend, adaptProblem } from "./adapters";

/**
 * Fetches real sliding-window trend calculations and emerging spike detections.
 * @param {string} [accountId] - Account ID filter
 */
export async function getTrendsData(accountId = null) {
  try {
    const accParam = accountId ? `?account_id=${encodeURIComponent(accountId)}` : "";
    const [rawTrends, rawProblems] = await Promise.all([
      apiGet(`/trends${accParam}`),
      apiGet(`/problems${accParam ? accParam + "&limit=100" : "?limit=100"}`).catch(() => []),
    ]);

    const trends = (Array.isArray(rawTrends) ? rawTrends : []).map(adaptTrend);
    const problems = (Array.isArray(rawProblems) ? rawProblems : []).map(adaptProblem);
    const probMap = new Map(problems.map((p) => [String(p.id), p]));

    const enrichTrend = (t) => {
      const p = probMap.get(String(t.problemId)) || {};
      return {
        id: String(t.problemId || t.id),
        name: t.problemName || p.name || `Signal #${t.problemId}`,
        problemId: String(t.problemId),
        growthRate: t.growthRate,
        growthLabel: t.growthPercent,
        growthPercent: t.growthPercent,
        currentCount: t.currentCount,
        previousCount: t.previousCount,
        timeWindow: t.timeWindow,
        shortExplanation: p.shortExplanation || `Recent volume shift: ${t.currentCount} current mentions vs ${t.previousCount} baseline.`,
        firstDetected: p.firstDetected || "Recent sync",
        feedbackCount: t.currentCount || p.feedbackCount || 0,
        product: p.product || "Core Application",
        platform: p.platform || "Multi-channel",
        priorityScore: p.priorityScore || 0.8,
        status: t.isEmerging ? "emerging" : p.status || "active",
        isEmerging: t.isEmerging,
      };
    };

    const enriched = trends.map(enrichTrend);

    const rising = enriched
      .filter((t) => t.growthRate > 0)
      .sort((a, b) => b.growthRate - a.growthRate);

    const declining = enriched
      .filter((t) => t.growthRate < 0)
      .sort((a, b) => a.growthRate - b.growthRate);

    const emerging = enriched.filter((t) => t.isEmerging);

    return {
      rising,
      declining,
      emerging,
      allTrends: enriched,
      isLive: true,
    };
  } catch (err) {
    console.error("Failed to fetch trends from backend:", err.message);
    return {
      rising: [],
      declining: [],
      emerging: [],
      allTrends: [],
      isLive: false,
      error: err.message,
    };
  }
}
