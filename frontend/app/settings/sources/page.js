"use client";

import DashboardShell from "../../../components/dashboard/DashboardShell";

export default function SettingsSourcesPage() {
  return (
    <DashboardShell
      initialNav="settings"
      initialSettingsTab="sources"
      onNavigateLanding={() => (window.location.href = "/")}
    />
  );
}
