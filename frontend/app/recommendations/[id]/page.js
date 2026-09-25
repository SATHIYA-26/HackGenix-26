"use client";

import DashboardShell from "../../../components/dashboard/DashboardShell";

export default function RecommendationDetailPage({ params }) {
  return (
    <DashboardShell
      initialNav="recommendations"
      initialProblemId={params?.id || "prob-1"}
      onNavigateLanding={() => (window.location.href = "/")}
    />
  );
}
