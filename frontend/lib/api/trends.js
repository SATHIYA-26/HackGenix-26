import { PROBLEMS } from "../../components/dashboard/data/intelligenceMockData";

/**
 * Trends API Client
 * Designed for seamless swap to FastAPI backend endpoints: GET /api/v1/trends
 */
export async function getTrendsData() {
  await new Promise((resolve) => setTimeout(resolve, 60));

  const rising = PROBLEMS.filter((p) => p.growthRate > 0.25).sort((a, b) => b.growthRate - a.growthRate);
  const declining = PROBLEMS.filter((p) => p.growthRate < 0).sort((a, b) => a.growthRate - b.growthRate);
  const emerging = PROBLEMS.filter((p) => p.status === "emerging");

  return {
    rising,
    declining,
    emerging,
    sentimentTrajectory: [
      { date: "Day 1", positive: 450, negative: 180, neutral: 120 },
      { date: "Day 5", positive: 480, negative: 210, neutral: 110 },
      { date: "Day 10", positive: 510, negative: 320, neutral: 130 },
      { date: "Day 15", positive: 530, negative: 460, neutral: 140 },
      { date: "Day 20", positive: 520, negative: 490, neutral: 125 },
      { date: "Day 25", positive: 560, negative: 540, neutral: 135 },
      { date: "Day 30", positive: 590, negative: 510, neutral: 140 },
    ],
  };
}

export async function getEmergingSignals() {
  await new Promise((resolve) => setTimeout(resolve, 50));
  return PROBLEMS.filter((p) => p.status === "emerging");
}
