"use client";

import DashboardShell from "../../components/dashboard/DashboardShell";

export default function DashboardsPage() {
  return <DashboardShell initialNav="dashboard" onNavigateLanding={() => (window.location.href = "/")} />;
}
