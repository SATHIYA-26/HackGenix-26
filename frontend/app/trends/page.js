"use client";

import DashboardShell from "../../components/dashboard/DashboardShell";

export default function TrendsPage() {
  return <DashboardShell initialNav="trends" onNavigateLanding={() => (window.location.href = "/")} />;
}
