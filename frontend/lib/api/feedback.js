import { getFullFeedbackDatabase, RAW_FEEDBACK_ITEMS } from "../../components/dashboard/data/intelligenceMockData";

/**
 * Feedback API Client
 * Designed for seamless swap to FastAPI backend endpoints: GET /api/v1/feedback
 */
export async function getFeedbackList({
  page = 1,
  limit = 25,
  problemId = null,
  source = "all",
  sentiment = "all",
  platform = "all",
  search = "",
} = {}) {
  await new Promise((resolve) => setTimeout(resolve, 80));

  let all = getFullFeedbackDatabase();

  if (problemId) {
    all = all.filter((f) => f.problemId === problemId);
  }

  if (source && source !== "all") {
    all = all.filter((f) => f.source.toLowerCase() === source.toLowerCase());
  }

  if (sentiment && sentiment !== "all") {
    all = all.filter((f) => f.sentiment.toLowerCase() === sentiment.toLowerCase());
  }

  if (platform && platform !== "all") {
    all = all.filter((f) => f.platform.toLowerCase() === platform.toLowerCase());
  }

  if (search && search.trim() !== "") {
    const q = search.toLowerCase();
    all = all.filter(
      (f) =>
        f.text.toLowerCase().includes(q) ||
        f.authorName.toLowerCase().includes(q) ||
        f.intent.toLowerCase().includes(q) ||
        f.problemName.toLowerCase().includes(q)
    );
  }

  const total = all.length;
  const start = (page - 1) * limit;
  const paginated = all.slice(start, start + limit);

  return {
    data: paginated,
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  };
}

export async function getFeedbackById(id) {
  await new Promise((resolve) => setTimeout(resolve, 50));
  const all = getFullFeedbackDatabase();
  const item = all.find((f) => f.id === id);
  if (!item) {
    throw new Error(`Feedback item '${id}' not found`);
  }
  return item;
}

export async function getSimilarFeedback(feedbackId) {
  await new Promise((resolve) => setTimeout(resolve, 100));
  const all = getFullFeedbackDatabase();
  const current = all.find((f) => f.id === feedbackId);
  if (!current) return [];

  // Match items with same problem or same intent
  return all
    .filter((f) => f.id !== feedbackId && (f.problemId === current.problemId || f.intent === current.intent))
    .slice(0, 5);
}
