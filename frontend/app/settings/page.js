"use client";

import DashboardShell from "../../components/dashboard/DashboardShell";

export default function SettingsPage() {
  return (
    <DashboardShell
      initialNav="settings"
      initialSettingsTab="taxonomy"
      onNavigateLanding={() => (window.location.href = "/")}
    />
  );
}
