"use client";

import DashboardShell from "../../../components/dashboard/DashboardShell";

export default function SettingsMembersPage() {
  return (
    <DashboardShell
      initialNav="settings"
      initialSettingsTab="team"
      onNavigateLanding={() => (window.location.href = "/")}
    />
  );
}
