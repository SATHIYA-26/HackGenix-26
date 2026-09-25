import { AI_BRIEF, PROBLEMS, getFullFeedbackDatabase } from "../../components/dashboard/data/intelligenceMockData";

/**
 * Insights & AI NLP API Client
 * Designed for semantic queries & weekly signal summaries: GET /api/v1/insights
 */
export async function getAIBrief() {
  await new Promise((resolve) => setTimeout(resolve, 50));
  return AI_BRIEF;
}

export async function askAIQuestion(query) {
  await new Promise((resolve) => setTimeout(resolve, 400));
  const q = query.toLowerCase();

  if (q.includes("payment") || q.includes("upi") || q.includes("checkout")) {
    const upiProblem = PROBLEMS.find((p) => p.id === "prob-1");
    const evidence = getFullFeedbackDatabase().filter((f) => f.problemId === "prob-1");
    return {
      answer: `UPI payment failures increased 74% this week, with 127 total related customer feedback items identified. 91% of feedback expresses severe negative sentiment. The surge is specifically concentrated among Android users running v4.2.1 encountering bank webhook timeout discrepancies where money is deducted but the order status shows failed.`,
      problemId: "prob-1",
      problemName: upiProblem.name,
      evidenceCount: evidence.length,
      negativeSentiment: "91%",
      concentratedIn: "Android v4.2.1 (Checkout)",
      recommendedAction: "Audit Razorpay/Juspay webhook idempotency handler and deploy graceful retry banner.",
      citations: evidence.slice(0, 3),
    };
  }

  if (q.includes("emerging") || q.includes("new") || q.includes("growing")) {
    const emerging = PROBLEMS.filter((p) => p.status === "emerging");
    return {
      answer: `We detected 3 distinct emerging problems this week with velocity spikes over +50%: 1) Trial Room Wait Queue Bottlenecks (+125%), 2) 4K Ultra-HD Buffering (+85%), and 3) Coupon code cart freeze on low-RAM devices (+42%).`,
      problemId: emerging[0]?.id || "prob-7",
      problemName: emerging[0]?.name || "Emerging Signals",
      evidenceCount: 68,
      negativeSentiment: "78%",
      concentratedIn: "Multi-platform",
      recommendedAction: "Review emerging problem clusters and prioritize team allocation for upcoming sprint.",
      citations: getFullFeedbackDatabase().slice(0, 2),
    };
  }

  // General grounded synthesis
  return {
    answer: `Analysis across 12,482 customer feedback items indicates that payment reliability and app stability represent 68% of all negative customer voice this week. Login complaints dropped 18% following the SMS gateway patch, proving effective mitigation.`,
    problemId: "prob-1",
    problemName: "General Feedback Intelligence Synthesis",
    evidenceCount: 127,
    negativeSentiment: "64%",
    concentratedIn: "Cross-platform ecosystem",
    recommendedAction: "Focus on checkout reliability to protect quarterly revenue metrics.",
    citations: getFullFeedbackDatabase().slice(0, 2),
  };
}
