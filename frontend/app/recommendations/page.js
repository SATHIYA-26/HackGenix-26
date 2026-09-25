"use client";

import DashboardShell from "../../components/dashboard/DashboardShell";

export default function RecommendationsPage() {
  return <DashboardShell initialNav="recommendations" onNavigateLanding={() => (window.location.href = "/")} />;
}
