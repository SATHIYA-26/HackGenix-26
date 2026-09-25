"use client";

import DashboardShell from "../../../components/dashboard/DashboardShell";

export default function SettingsAIPage() {
  return (
    <DashboardShell
      initialNav="settings"
      initialSettingsTab="ai"
      onNavigateLanding={() => (window.location.href = "/")}
    />
  );
}
