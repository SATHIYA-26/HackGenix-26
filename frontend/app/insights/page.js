"use client";

import DashboardShell from "../../components/dashboard/DashboardShell";

export default function InsightsPage() {
  return <DashboardShell initialNav="insights" onNavigateLanding={() => (window.location.href = "/")} />;
}
