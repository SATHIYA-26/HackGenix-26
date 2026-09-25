/**
 * Feedback Intelligence Platform - Schema Adapters
 * Normalizes FastAPI snake_case schemas into frontend camelCase components.
 */

export function adaptProblem(raw) {
  if (!raw) return null;

  const dims = raw.product_dimension || {};
  const priorityScore = raw.priority_score ?? 0.0;
  const growthRate = raw.growth_rate ?? 0.0;
  const avgSentiment = raw.average_sentiment ?? -0.5;

  // Determine UI status badge
  let status = "monitoring";
  if (priorityScore >= 0.75) {
    status = "critical";
  } else if (growthRate >= 0.40) {
    status = "emerging";
  } else if (avgSentiment > 0.1) {
    status = "improving";
  }

  const negRatio = Math.max(0, Math.min(1, (-avgSentiment + 1) / 2));

  return {
    id: String(raw.id),
    name: raw.name || "Untitled Problem Cluster",
    category: dims.feature || dims.component || "Core Functionality",
    feedbackCount: raw.feedback_count || 0,
    growthRate: growthRate,
    growthLabel: `${growthRate >= 0 ? "+" : ""}${Math.round(growthRate * 100)}%`,
    negativeSentiment: negRatio,
    priorityScore: priorityScore,
    status: status,
    product: dims.feature ? dims.feature.charAt(0).toUpperCase() + dims.feature.slice(1) : "Platform",
    platform: dims.platform ? dims.platform.charAt(0).toUpperCase() + dims.platform.slice(1) : "All Platforms",
    version: dims.version || "Latest",
    sources: ["YouTube", "Google Play", "Support"],
    shortExplanation: raw.description || "Identified recurring customer friction cluster.",
    summary: raw.description || "Identified recurring customer friction cluster.",
    affectedArea: dims.feature || "User Journey",
    priorityBreakdown: raw.priority_breakdown || null,
    createdAt: raw.created_at,
    updatedAt: raw.updated_at,
  };
}

export function adaptFeedback(raw) {
  if (!raw) return null;

  const analysis = raw.analysis || {};
  const meta = raw.metadata || {};

  return {
    id: raw.feedback_id || String(raw.id),
    dbId: raw.id,
    text: raw.text || "",
    source: raw.source || "youtube",
    sourceUrl: raw.source_url || (meta.video_id ? `https://www.youtube.com/watch?v=${meta.video_id}` : null),
    rating: raw.rating,
    authorName: meta.author || "YouTube User",
    authorAvatar: meta.author_avatar || "",
    likeCount: meta.like_count || 0,
    videoTitle: meta.video_title || "",
    channelTitle: meta.channel_title || "",
    createdAt: raw.created_at,
    sentiment: analysis.sentiment || "negative",
    sentimentScore: analysis.sentiment_score ?? -0.5,
    intent: analysis.intent || "feedback",
    intentScore: analysis.intent_score ?? 0.8,
    isNoise: analysis.is_noise || false,
    problemId: raw.problem_id || null,
    problemName: raw.problem_name || null,
    platform: meta.platform || "Web / Mobile",
    version: meta.version || "Latest",
  };
}

export function adaptRecommendation(raw) {
  if (!raw) return null;

  return {
    id: String(raw.id),
    problemId: String(raw.problem_id),
    problemName: raw.problem_name || `Problem #${raw.problem_id}`,
    recommendation: raw.recommendation,
    title: raw.recommendation,
    reason: raw.reason,
    evidence: raw.evidence || {},
    confidence: raw.confidence ?? 0.85,
    confidencePercent: `${Math.round((raw.confidence ?? 0.85) * 100)}%`,
    createdAt: raw.created_at,
  };
}

export function adaptTrend(raw) {
  if (!raw) return null;

  const growth = raw.growth_rate ?? 0.0;
  return {
    id: String(raw.id),
    problemId: String(raw.problem_id),
    problemName: raw.problem_name || `Problem #${raw.problem_id}`,
    timeWindow: raw.time_window || "7d",
    currentCount: raw.current_count || 0,
    previousCount: raw.previous_count || 0,
    growthRate: growth,
    growthPercent: `${growth >= 0 ? "+" : ""}${Math.round(growth * 100)}%`,
    isEmerging: raw.is_emerging || false,
    calculatedAt: raw.calculated_at,
  };
}

export function adaptDashboardSummary(raw) {
  if (!raw) return null;

  const topProblems = (raw.top_priority_problems || []).map(adaptProblem);
  const emergingTrends = (raw.emerging_trends || []).map(adaptTrend);

  return {
    totalFeedback: raw.total_feedback || 0,
    analyzedFeedback: raw.analyzed_feedback || 0,
    totalProblems: raw.total_problems || 0,
    emergingCount: raw.emerging_problems_count || 0,
    avgSentimentScore: raw.average_sentiment_score ?? 0.0,
    sentimentDistribution: raw.sentiment_distribution || { positive: 0, neutral: 0, negative: 0 },
    intentDistribution: raw.intent_distribution || {},
    sourceDistribution: raw.source_distribution || {},
    topProblems: topProblems,
    emergingTrends: emergingTrends,
  };
}
