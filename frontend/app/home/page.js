"use client";

import DashboardShell from "../../components/dashboard/DashboardShell";

export default function HomePage() {
  return <DashboardShell initialNav="dashboard" onNavigateLanding={() => (window.location.href = "/")} />;
}
