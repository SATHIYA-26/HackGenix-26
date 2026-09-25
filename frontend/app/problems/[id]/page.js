"use client";

import DashboardShell from "../../../components/dashboard/DashboardShell";

export default function ProblemDetailPage({ params }) {
  return (
    <DashboardShell
      initialNav="problems"
      initialProblemId={params?.id || "prob-1"}
      onNavigateLanding={() => (window.location.href = "/")}
    />
  );
}
