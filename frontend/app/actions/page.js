"use client";

import DashboardShell from "../../components/dashboard/DashboardShell";

export default function ActionsPage() {
  return <DashboardShell initialNav="actions" onNavigateLanding={() => (window.location.href = "/")} />;
}
