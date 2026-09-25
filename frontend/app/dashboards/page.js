"use client";

import DashboardShell from "../../components/dashboard/DashboardShell";

export default function DashboardsPage() {
  return <DashboardShell initialNav="dashboards" onNavigateLanding={() => (window.location.href = "/")} />;
}
