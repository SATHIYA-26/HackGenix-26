"use client";

import DashboardShell from "../../../components/dashboard/DashboardShell";

export default function DashboardSubPage({ params }) {
  return (
    <DashboardShell
      initialNav="dashboards"
      onNavigateLanding={() => (window.location.href = "/")}
    />
  );
}
