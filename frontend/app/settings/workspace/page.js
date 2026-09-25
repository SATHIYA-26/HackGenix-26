"use client";

import DashboardShell from "../../../components/dashboard/DashboardShell";

export default function SettingsWorkspacePage() {
  return (
    <DashboardShell
      initialNav="settings"
      initialSettingsTab="workspace"
      onNavigateLanding={() => (window.location.href = "/")}
    />
  );
}
