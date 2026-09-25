"use client";

import DashboardShell from "../../components/dashboard/DashboardShell";

export default function FeedbackPage() {
  return <DashboardShell initialNav="feedback" onNavigateLanding={() => (window.location.href = "/")} />;
}
