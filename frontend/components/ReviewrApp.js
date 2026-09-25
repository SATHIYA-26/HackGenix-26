"use client";

import { useState, useEffect } from "react";
import DovetailCursor from "./DovetailCursor";
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
  const [currentAccountId, setCurrentAccountId] = useState("acc_manis");
  const [accounts, setAccounts] = useState(REVIEWR_ACCOUNTS);
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);
  const [demoModalPlan, setDemoModalPlan] = useState(null);

  const currentAccount = accounts.find((a) => a.id === currentAccountId) || accounts[0];

  useEffect(() => {
    // Sync browser path if accessed directly
    if (typeof window !== "undefined") {
      const path = window.location.pathname;
      if (path === "/login") {
        setActiveView("login");
      } else if (path === "/dashboard") {
        setActiveView("dashboard");
        setIsAuthenticated(true);
      } else if (path === "/") {
        setActiveView("landing");
      }
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
    setIsAuthenticated(true);
    setActiveView("dashboard");
    if (typeof window !== "undefined") {
      window.history.pushState(null, "", "/dashboard");
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setActiveView("landing");
    if (typeof window !== "undefined") {
      window.history.pushState(null, "", "/");
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleAccountChange = (accountId) => {
    setCurrentAccountId(accountId);
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
      <>
        <DovetailCursor />
        <DashboardShell onNavigateLanding={() => handleNavigate("landing")} />
      </>
    );
  }

  return (
    <>
      {/* Ambient Particle Animation & Spotlight Engine */}
      <DovetailCursor />

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
