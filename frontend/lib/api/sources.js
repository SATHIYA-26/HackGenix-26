/**
 * Feedback Intelligence Platform - Sources & Ingestion API Client
 * Connects directly to FastAPI backend for live YouTube extraction and channel sync.
 */

import { apiGet, apiPost } from "./client";

/**
 * Triggers live YouTube extraction, canonical normalization, and full NLP analysis.
 * @param {Object} params
 * @param {string} [params.url] - Video URL or ID
 * @param {string} [params.channel] - Channel Handle or URL
 * @param {number} [params.maxComments=50] - Number of comments to extract
 * @param {number} [params.maxVideos=5] - Number of videos if channel
 * @param {boolean} [params.runNlp=true] - Run NLP & problem discovery immediately
 * @param {string} [params.accountId="acc_vj_sidhu"] - Target account ID to tag feedback with
 * @returns {Promise<any>} Extraction and pipeline summary
 */
export async function syncYouTubeLive({
  url,
  channel,
  maxComments = 50,
  maxVideos = 5,
  runNlp = true,
  accountId = "acc_vj_sidhu",
}) {
  const payload = {
    url: url || undefined,
    channel: channel || undefined,
    max_comments: maxComments,
    max_videos: maxVideos,
    run_nlp: runNlp,
    account_id: accountId || "acc_vj_sidhu",
  };

  return await apiPost("/connectors/youtube/live-sync", payload, {
    timeout: 120000, // Allow up to 2 mins for large video extractions & deep NLP batching
  });
}

/**
 * Lists all registered connectors and operational status with live counts.
 * @param {string} [accountId] - Optional account ID for real-time channel counts
 */
export async function getConnectedSources(accountId) {
  try {
    const url = accountId ? `/connectors?account_id=${encodeURIComponent(accountId)}` : "/connectors";
    const connectors = await apiGet(url);
    return (connectors || []).map((c) => ({
      id: `src-${c.source}`,
      source: c.source,
      name: c.name || c.source.replace("_", " ").toUpperCase(),
      description: c.description || `Streaming pipeline for ${c.name || c.source}`,
      type: c.source,
      status: c.status || "connected",
      lastSync: c.lastSync || "Live",
      health: "100%",
      totalFeedback: c.total_feedback ?? c.itemsCount ?? 0,
      itemsCount: c.total_feedback ?? c.itemsCount ?? 0,
      latency: c.latency || "Live",
      icon: c.icon || c.source,
      accent: c.accent || (c.source === "youtube" ? "#EF4444" : "#0284C7"),
      bgAccent: c.bgAccent || (c.source === "youtube" ? "#FEF2F2" : "#F0F9FF"),
      borderAccent: c.borderAccent || (c.source === "youtube" ? "#FECACA" : "#BAE6FD"),
    }));
  } catch (err) {
    console.error("Backend /connectors failed:", err.message);
    return [];
  }
}
