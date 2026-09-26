"use client";

import { useState, useEffect } from "react";
import Navbar from "./Navbar";
import AnnouncementBar from "./AnnouncementBar";
import LandingView from "./LandingView";
import LoginView from "./LoginView";
import DashboardView from "./DashboardView";
import DashboardShell from "./dashboard/DashboardShell";
import LiveSyncModal from "./LiveSyncModal";
import DemoModal from "./DemoModal";
import { REVIEWR_ACCOUNTS } from "../lib/mockData";

export default function ReviewrApp({ initialView = "landing" }) {
  const [activeView, setActiveView] = useState(initialView);
  const [isAuthenticated, setIsAuthenticated] = useState(initialView === "dashboard");
  // Always start with a safe SSR default — hydrate from storage in useEffect to avoid hydration mismatch
  const [currentAccountId, setCurrentAccountId] = useState("acc_manis");
  const [isHydrated, setIsHydrated] = useState(false);
  const [accounts, setAccounts] = useState(REVIEWR_ACCOUNTS);
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);
  const [demoModalPlan, setDemoModalPlan] = useState(null);

  const currentAccount = accounts.find((a) => a.id === currentAccountId) || accounts[0];

  useEffect(() => {
    // Client-only: restore persisted account ID and sync path after hydration
    const savedAccount = localStorage.getItem("reviewr_account_id") || sessionStorage.getItem("reviewr_account_id");
    if (savedAccount) {
      setCurrentAccountId(savedAccount);
      setIsAuthenticated(true);
    }
    setIsHydrated(true);

    const path = window.location.pathname;
    if (path === "/login") {
      setActiveView("login");
    } else if (path === "/dashboard" || path === "/home" || path === "/sources" || path === "/problems" || path === "/trends" || path === "/insights" || path === "/feedback" || path === "/recommendations" || path === "/actions" || path === "/settings") {
      setActiveView("dashboard");
      setIsAuthenticated(true);
    }
  }, []);

  const handleNavigate = (view) => {
    setActiveView(view);
    if (typeof window !== "undefined") {
      const targetPath = view === "landing" ? "/" : `/${view}`;
      window.history.pushState(null, "", targetPath);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleLoginSuccess = (accountId) => {
    setCurrentAccountId(accountId);
    // Persist so page reloads on /dashboard keep the right portal
    if (typeof window !== "undefined") {
      localStorage.setItem("reviewr_account_id", accountId);
      sessionStorage.setItem("reviewr_account_id", accountId);
    }
    setIsAuthenticated(true);
    setActiveView("dashboard");
    if (typeof window !== "undefined") {
      window.history.pushState(null, "", "/dashboard");
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentAccountId("acc_manis");
    if (typeof window !== "undefined") {
      localStorage.removeItem("reviewr_account_id");
      sessionStorage.removeItem("reviewr_account_id");
      window.history.pushState(null, "", "/");
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
    setActiveView("landing");
  };

  const handleAccountChange = (accountId) => {
    setCurrentAccountId(accountId);
    if (typeof window !== "undefined") {
      localStorage.setItem("reviewr_account_id", accountId);
      sessionStorage.setItem("reviewr_account_id", accountId);
    }
  };

  const handleOpenDemoModal = (plan = null) => {
    setDemoModalPlan(plan);
    setIsDemoModalOpen(true);
  };

  const handleCloseDemoModal = () => {
    setIsDemoModalOpen(false);
    setDemoModalPlan(null);
  };

  const handleOpenSyncModal = () => {
    setIsSyncModalOpen(true);
  };

  const handleCloseSyncModal = () => {
    setIsSyncModalOpen(false);
  };

  const handleAddFeedbackItem = (newComment) => {
    setAccounts((prevAccounts) =>
      prevAccounts.map((acc) => {
        if (acc.id === currentAccountId) {
          return {
            ...acc,
            feedbackItems: [newComment, ...(acc.feedbackItems || [])],
          };
        }
        return acc;
      })
    );
  };

  const handleScrollToSection = (sectionId) => {
    if (activeView !== "landing") {
      setActiveView("landing");
      if (typeof window !== "undefined") {
        window.history.pushState(null, "", "/");
      }
    }
    setTimeout(() => {
      const el = document.getElementById(sectionId);
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
      }
    }, 100);
  };

  if (activeView === "dashboard") {
    return (
      <DashboardShell
        currentAccount={currentAccount}
        currentAccountId={currentAccountId}
        accounts={accounts}
        onAccountChange={handleAccountChange}
        onNavigateLanding={handleLogout}
        onLogout={handleLogout}
      />
    );
  }

  return (
    <>
      {/* Ambient Gradient Glow */}
      <div className="bg-glow-wrapper" aria-hidden="true" />

      {/* Top Sticky Navigation Bar */}
      <Navbar
        activeView={activeView}
        isAuthenticated={isAuthenticated}
        currentAccountId={currentAccountId}
        currentAccount={currentAccount}
        onNavigate={handleNavigate}
        onAccountChange={handleAccountChange}
        onOpenSyncModal={handleOpenSyncModal}
        onOpenDemoModal={handleOpenDemoModal}
        onLogout={handleLogout}
        onScrollToSection={handleScrollToSection}
      />

      {/* Announcement Bar (Reviewr AI - Located Below Navbar) */}
      <AnnouncementBar onScrollToSection={handleScrollToSection} />

      {/* VIEW 1: LANDING PAGE */}
      <LandingView
        isActive={activeView === "landing"}
        onOpenDemoModal={handleOpenDemoModal}
        onScrollToSection={handleScrollToSection}
      />

      {/* VIEW 2: LOGIN PAGE */}
      <LoginView
        isActive={activeView === "login"}
        onLoginSuccess={handleLoginSuccess}
        onNavigateLanding={() => handleNavigate("landing")}
      />

      {/* VIEW 3: DASHBOARD VIEW */}
      <DashboardView
        isActive={activeView === "dashboard"}
        currentAccount={currentAccount}
        onOpenSyncModal={handleOpenSyncModal}
      />

      {/* Interactive Live Sync Modal */}
      <LiveSyncModal
        isOpen={isSyncModalOpen}
        onClose={handleCloseSyncModal}
        currentAccount={currentAccount}
        currentAccountId={currentAccountId}
        onAccountChange={handleAccountChange}
        onAddFeedbackItem={handleAddFeedbackItem}
      />

      {/* Interactive Book a Demo Modal */}
      <DemoModal
        isOpen={isDemoModalOpen}
        planName={demoModalPlan}
        onClose={handleCloseDemoModal}
      />
    </>
  );
}
