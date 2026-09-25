"use client";

import OnboardingView from "../../components/dashboard/views/OnboardingView";

export default function OnboardingPage() {
  return <OnboardingView onComplete={() => (window.location.href = "/dashboard")} />;
}
