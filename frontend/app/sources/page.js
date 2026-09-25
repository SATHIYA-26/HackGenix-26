"use client";

import DashboardShell from "../../components/dashboard/DashboardShell";

export default function SourcesPage() {
  return <DashboardShell initialNav="sources" onNavigateLanding={() => (window.location.href = "/")} />;
}
