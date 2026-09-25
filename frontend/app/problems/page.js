"use client";

import DashboardShell from "../../components/dashboard/DashboardShell";

export default function ProblemsPage() {
  return <DashboardShell initialNav="problems" onNavigateLanding={() => (window.location.href = "/")} />;
}
