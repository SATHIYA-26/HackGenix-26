"use client";

import DashboardShell from "../../../components/dashboard/DashboardShell";

export default function FeedbackDetailPage({ params }) {
  return (
    <DashboardShell
      initialNav="feedback"
      initialFeedbackId={params?.id || "fb-101"}
      onNavigateLanding={() => (window.location.href = "/")}
    />
  );
}
