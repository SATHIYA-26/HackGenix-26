"use client";

import { useState, useEffect } from "react";
import {
  LayoutDashboard,
  Sparkles,
  AlertTriangle,
  TrendingUp,
  MessageSquare,
  Globe,
  Lightbulb,
  CheckCircle2,
  BarChart3,
  Settings,
  Search,
  Bell,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  ExternalLink,
  LogOut,
  ArrowLeft,
  Plus,
  ShieldCheck,
  ChevronsUpDown,
  Check,
} from "lucide-react";
import HomeView from "./views/HomeView";
import ProblemsView from "./views/ProblemsView";
import ProblemDetailView from "./views/ProblemDetailView";
import InsightsView from "./views/InsightsView";
import TrendsView from "./views/TrendsView";
import FeedbackView from "./views/FeedbackView";
import SourcesView from "./views/SourcesView";
import RecommendationsView from "./views/RecommendationsView";
import ActionsView from "./views/ActionsView";
import CustomDashboardsView from "./views/CustomDashboardsView";
import SettingsView from "./views/SettingsView";

import CommandPaletteModal from "./modals/CommandPaletteModal";
import AskAIModal from "./modals/AskAIModal";
import ConnectSourceModal from "./modals/ConnectSourceModal";
import CreateActionModal from "./modals/CreateActionModal";
import FeedbackDetailDrawer from "./modals/FeedbackDetailDrawer";

import {
  USER_PROFILE,
  PROBLEMS,
  ACTIONS,
  CONNECTED_SOURCES,
  getFullFeedbackDatabase,
  getCompanyIntelligence,
} from "./data/intelligenceMockData";

const DEMO_COMPANIES = [
  {
    id: "acc_manis",
    name: "Mani's Dum Biriyani",
    owner: "Mani (Founder & Operations)",
    badge: "4 Branches",
    category: "Food & Restaurant Chain",
    logo: "/assets/logos/manis_dum_biriyani.png",
  },
  {
    id: "acc_chepauk",
    name: "Chepauk Sports Store",
    owner: "Murali (Store General Manager)",
    badge: "Retail Store",
    category: "Sports & Cricket Retail",
    logo: "/assets/logos/chepauk_sports.png",
  },
  {
    id: "acc_hm",
    name: "H&M Mylapore Branch",
    owner: "Pooja Sundaram (Store CX Lead)",
    badge: "Fashion Showroom",
    category: "Fashion Retail Showroom",
    logo: "/assets/logos/hm_mylapore.png",
  },
  {
    id: "acc_vj_sidhu",
    name: "VJ Sidhu Vlogs",
    owner: "VJ Sidhu (Creator & Producer)",
    badge: "YouTube Channel",
    category: "YouTube Creator Channel",
    logo: "/assets/logos/vj_sidhu_vlogs.png",
  },
  {
    id: "acc_spotify",
    name: "Spotify Android",
    owner: "Elena Rostova (Android Core PM)",
    badge: "Play Store App",
    category: "Google Play Store App",
    logo: "/assets/logos/spotify.png",
  },
];

export default function DashboardShell({
  initialNav = "dashboard",
  initialProblemId = null,
  initialFeedbackId = null,
  initialSettingsTab = "taxonomy",
  onNavigateLanding,
  currentAccountId = "acc_manis",
  currentAccount = null,
  accounts = [],
  onAccountChange = () => {},
}) {
  const [activeNav, setActiveNav] = useState(initialNav);
  const [selectedProblemId, setSelectedProblemId] = useState(initialProblemId);
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [actionTargetProblem, setActionTargetProblem] = useState(null);

  // Business company workspace switcher state
  const [selectedAccountId, setSelectedAccountId] = useState(currentAccountId || "acc_manis");
  const [isCompanyDropdownOpen, setIsCompanyDropdownOpen] = useState(false);

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Modals state
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isAskAIOpen, setIsAskAIOpen] = useState(false);
  const [askAIInitialQuery, setAskAIInitialQuery] = useState("");
  const [isConnectSourceOpen, setIsConnectSourceOpen] = useState(false);
  const [isCreateActionOpen, setIsCreateActionOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  // Synchronize company account if changed from parent
  useEffect(() => {
    if (currentAccountId) {
      setSelectedAccountId(currentAccountId);
    }
  }, [currentAccountId]);

  const company = getCompanyIntelligence(selectedAccountId);

  const handleSelectCompany = (accId) => {
    setSelectedAccountId(accId);
    setIsCompanyDropdownOpen(false);
    setSelectedProblemId(null);
    if (onAccountChange) {
      onAccountChange(accId);
    }
  };

  // Deep-linking listeners
  useEffect(() => {
    if (initialProblemId) {
      setSelectedProblemId(initialProblemId);
    }
  }, [initialProblemId]);

  useEffect(() => {
    if (initialFeedbackId) {
      const fb = getFullFeedbackDatabase().find((f) => f.id === initialFeedbackId);
      if (fb) setSelectedFeedback(fb);
    }
  }, [initialFeedbackId]);

  // Keyboard shortcut ⌘K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleNavClick = (navId) => {
    setActiveNav(navId);
    setSelectedProblemId(null);
    if (typeof window !== "undefined") {
      const targetUrl = navId === "home" ? "/dashboard" : `/${navId}`;
      window.history.pushState(null, "", targetUrl);
    }
  };

  const handleSelectProblem = (probId) => {
    setSelectedProblemId(probId);
    if (typeof window !== "undefined") {
      window.history.pushState(null, "", `/problems/${probId}`);
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleBackToProblems = () => {
    setSelectedProblemId(null);
    setActiveNav("problems");
    if (typeof window !== "undefined") {
      window.history.pushState(null, "", "/problems");
    }
  };

  const handleSelectFeedback = (fb) => {
    setSelectedFeedback(fb);
    if (fb && typeof window !== "undefined") {
      window.history.pushState(null, "", `/feedback/${fb.id}`);
    }
  };

  const handleOpenAskAI = (promptText = "") => {
    setAskAIInitialQuery(promptText);
    setIsAskAIOpen(true);
  };

  const handleOpenCreateAction = (prob) => {
    setActionTargetProblem(prob || (company.problems && company.problems[0]) || PROBLEMS[0]);
    setIsCreateActionOpen(true);
  };

  const compProblems = company?.problems && company.problems.length > 0 ? company.problems : PROBLEMS;
  const compSources = company?.sources && company.sources.length > 0 ? company.sources : CONNECTED_SOURCES;
  const compActions = company?.actions && company.actions.length > 0 ? company.actions : ACTIONS;
  const notificationsList = company?.notifications && company.notifications.length > 0 ? company.notifications : USER_PROFILE.notifications;

  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "insights", label: "Insights", icon: Sparkles },
    {
      id: "problems",
      label: "Problems",
      icon: AlertTriangle,
      badge: compProblems.filter((p) => p.status === "critical" || p.status === "emerging").length,
    },
    { id: "trends", label: "Trends", icon: TrendingUp },
    { id: "feedback", label: "Feedback", icon: MessageSquare },
    { id: "sources", label: "Sources", icon: Globe, count: compSources.length },
    { id: "recommendations", label: "Recommendations", icon: Lightbulb },
    { id: "actions", label: "Actions", icon: CheckCircle2, count: compActions.length },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  return (
    <div className="flex h-screen bg-[#FBF9F5] text-[#18181B] font-sans overflow-hidden antialiased">
      {/* ─── DESKTOP & TABLET SIDEBAR ─── */}
      <aside
        className={`bg-white border-r border-[#E5E1D8] flex flex-col shrink-0 transition-all duration-200 z-30 ${
          isSidebarCollapsed ? "w-[72px]" : "w-[250px]"
        } hidden md:flex`}
      >
        {/* Workspace Brand & Company Switcher Header */}
        <div className="relative border-b border-[#ECE8E0]">
          <div className="h-16 flex items-center justify-between px-3">
            <button
              onClick={() => setIsCompanyDropdownOpen(!isCompanyDropdownOpen)}
              className={`flex items-center gap-2.5 overflow-hidden text-left p-1.5 rounded-xl hover:bg-[#F4F1EA] transition-all flex-1 min-w-0 ${
                isSidebarCollapsed ? "justify-center p-1" : ""
              }`}
              title={isSidebarCollapsed ? `${company.name} (Click to switch company)` : undefined}
            >
              <img
                src={company.logo}
                alt={company.name}
                className="w-8 h-8 rounded-lg object-cover border border-[#E5E1D8] shadow-xs shrink-0 bg-white"
              />
              {!isSidebarCollapsed && (
                <div className="min-w-0 flex-1">
                  <span className="text-xs font-bold tracking-tight text-[#18181B] truncate block font-serif">
                    {company.name}
                  </span>
                  <span className="text-[10px] text-[#71717A] block truncate font-medium">
                    {company.category}
                  </span>
                </div>
              )}
              {!isSidebarCollapsed && (
                <ChevronsUpDown className="w-3.5 h-3.5 text-[#71717A] shrink-0" />
              )}
            </button>

            <button
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className="p-1.5 rounded-lg text-[#71717A] hover:bg-[#F4F1EA] hover:text-[#18181B] transition-colors ml-1 shrink-0"
              title={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {isSidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
          </div>

          {/* Interactive Company Workspace Switcher Dropdown */}
          {isCompanyDropdownOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setIsCompanyDropdownOpen(false)}
              />
              <div className="absolute top-16 left-2 right-2 bg-white rounded-xl shadow-2xl border border-[#E5E1D8] p-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="px-2.5 py-1.5 border-b border-[#ECE8E0] mb-1">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[#71717A]">
                    Select Company Workspace
                  </p>
                  <p className="text-[11px] text-[#A1A1AA]">
                    Instant 1-click multi-business switch
                  </p>
                </div>
                <div className="space-y-1">
                  {DEMO_COMPANIES.map((c) => {
                    const isSelected = c.id === selectedAccountId;
                    return (
                      <button
                        key={c.id}
                        onClick={() => handleSelectCompany(c.id)}
                        className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-left transition-all ${
                          isSelected
                            ? "bg-[#18181B] text-white"
                            : "hover:bg-[#F4F1EA] text-[#18181B]"
                        }`}
                      >
                        <img
                          src={c.logo}
                          alt={c.name}
                          className="w-7 h-7 rounded-md object-cover border border-[#E5E1D8]/40 shrink-0 bg-white"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between">
                            <p className={`text-xs font-bold truncate ${isSelected ? "text-white" : "text-[#18181B]"}`}>
                              {c.name}
                            </p>
                            <span
                              className={`text-[9px] px-1 rounded font-medium ${
                                isSelected ? "bg-white/20 text-white" : "bg-[#F4F1EA] text-[#71717A]"
                              }`}
                            >
                              {c.badge}
                            </span>
                          </div>
                          <p className={`text-[10px] truncate ${isSelected ? "text-white/70" : "text-[#71717A]"}`}>
                            {c.owner}
                          </p>
                        </div>
                        {isSelected && <Check className="w-3.5 h-3.5 text-white shrink-0 ml-1" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 py-4 px-2.5 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              (item.id === "dashboard"
                ? activeNav === "dashboard" || activeNav === "home" || activeNav === "dashboards"
                : activeNav === item.id) && !selectedProblemId;

            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                  isActive
                    ? "bg-[#18181B] text-white shadow-xs"
                    : "text-[#71717A] hover:bg-[#F4F1EA] hover:text-[#18181B]"
                } ${isSidebarCollapsed ? "justify-center px-0" : ""}`}
                title={isSidebarCollapsed ? item.label : undefined}
              >
                <Icon className="w-4 h-4 shrink-0" />
                {!isSidebarCollapsed && <span className="flex-1 text-left truncate">{item.label}</span>}
                {!isSidebarCollapsed && item.badge ? (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                      isActive ? "bg-white/20 text-white" : "bg-[#FFF1F2] text-[#E11D48]"
                    }`}
                  >
                    {item.badge}
                  </span>
                ) : null}
              </button>
            );
          })}
        </nav>

        {/* Sidebar Footer Company Owner Profile */}
        <div className="p-3 border-t border-[#ECE8E0] bg-[#FAF8F5]">
          <div className="flex items-center gap-2.5">
            <img
              src={company.avatar || company.logo}
              alt={company.ownerName}
              className="w-8 h-8 rounded-full object-cover border border-[#E5E1D8] shrink-0 bg-white"
            />
            {!isSidebarCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-[#18181B] truncate">{company.ownerName}</p>
                <p className="text-[10px] text-[#71717A] truncate">{company.ownerRole}</p>
              </div>
            )}
            {!isSidebarCollapsed && (
              <button
                onClick={onNavigateLanding}
                className="text-[#71717A] hover:text-[#18181B] p-1.5 rounded-lg hover:bg-[#EBE7DD] transition-colors"
                title="Return to Marketing Overview"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* ─── MOBILE DRAWER MENU ─── */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="relative w-72 max-w-full bg-white flex flex-col h-full z-10 border-r border-[#E5E1D8] shadow-2xl">
            <div className="p-4 border-b border-[#ECE8E0] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <img
                  src={company.logo}
                  alt={company.name}
                  className="w-8 h-8 rounded-lg object-cover border border-[#E5E1D8]"
                />
                <div>
                  <p className="text-xs font-bold text-[#18181B] truncate">{company.name}</p>
                  <p className="text-[10px] text-[#71717A] truncate">{company.category}</p>
                </div>
              </div>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-1 rounded-lg text-[#71717A] hover:bg-[#F4F1EA]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Mobile Company Switcher */}
            <div className="p-3 border-b border-[#ECE8E0] bg-[#FAF8F5]">
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#71717A] mb-2">
                Switch Company
              </p>
              <div className="space-y-1">
                {DEMO_COMPANIES.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => {
                      handleSelectCompany(c.id);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs font-medium text-left ${
                      c.id === selectedAccountId
                        ? "bg-[#18181B] text-white"
                        : "hover:bg-[#EBE7DD] text-[#18181B]"
                    }`}
                  >
                    <img src={c.logo} alt={c.name} className="w-5 h-5 rounded object-cover" />
                    <span className="truncate flex-1">{c.name}</span>
                    {c.id === selectedAccountId && <Check className="w-3.5 h-3.5 text-white" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Mobile Nav Links */}
            <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive =
                  (item.id === "dashboard"
                    ? activeNav === "dashboard" || activeNav === "home" || activeNav === "dashboards"
                    : activeNav === item.id) && !selectedProblemId;

                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      handleNavClick(item.id);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold ${
                      isActive
                        ? "bg-[#18181B] text-white"
                        : "text-[#71717A] hover:bg-[#F4F1EA] hover:text-[#18181B]"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="flex-1 text-left">{item.label}</span>
                    {item.badge && (
                      <span className="text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold bg-[#FFF1F2] text-[#E11D48]">
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>

            <div className="p-3 border-t border-[#ECE8E0] bg-[#FAF8F5]">
              <button
                onClick={onNavigateLanding}
                className="w-full py-2 px-3 rounded-lg border border-[#E5E1D8] text-xs font-semibold text-[#18181B] flex items-center justify-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                <span>Return to Overview</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── MAIN SHELL & TOP BAR ─── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Persistent Top Navigation Bar */}
        <header className="h-16 bg-white border-b border-[#E5E1D8] flex items-center justify-between px-4 md:px-8 shrink-0 z-20">
          <div className="flex items-center gap-3">
            {/* Mobile menu trigger */}
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="md:hidden p-1.5 rounded-lg border border-[#E5E1D8] text-[#71717A] hover:bg-[#F4F1EA]"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Global Search & Ask AI Trigger Button */}
            <button
              onClick={() => setIsCommandPaletteOpen(true)}
              className="flex items-center gap-3 bg-[#FBF9F5] border border-[#E5E1D8] hover:border-[#18181B] rounded-xl px-3.5 py-2 text-xs text-[#71717A] hover:text-[#18181B] transition-all max-w-md w-60 md:w-80 group"
            >
              <Search className="w-3.5 h-3.5 text-[#71717A] group-hover:text-[#18181B]" />
              <span className="flex-1 text-left truncate">
                Search {company.name} voices, issues...
              </span>
              <kbd className="hidden sm:inline-block font-mono text-[10px] bg-white border border-[#E5E1D8] px-1.5 py-0.5 rounded shadow-2xs text-[#71717A]">
                ⌘K
              </kbd>
            </button>

            {/* Active Company Badge in Header */}
            <div className="hidden lg:flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-[#FAF8F5] border border-[#ECE8E0] text-xs">
              <img src={company.logo} alt={company.name} className="w-4 h-4 rounded object-cover" />
              <span className="font-semibold text-[#18181B] max-w-[120px] truncate">{company.name}</span>
              <span className="text-[#A1A1AA]">·</span>
              <span className="text-[11px] text-[#71717A] max-w-[140px] truncate">{company.typeLabel || company.category}</span>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Ask AI prominent trigger button */}
            <button
              onClick={() => handleOpenAskAI()}
              className="h-9 px-3 rounded-lg bg-[#F5F3FF] border border-[#DDD6FE] text-[#7C3AED] hover:bg-[#EDE9FE] text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Ask AI Data</span>
            </button>

            {/* Notification Center with Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="w-9 h-9 rounded-lg border border-[#E5E1D8] hover:bg-[#F4F1EA] text-[#71717A] flex items-center justify-center transition-colors relative"
              >
                <Bell className="w-4 h-4" />
                {notificationsList.some((n) => n.unread) && (
                  <span className="w-2 h-2 rounded-full bg-[#E11D48] absolute top-2 right-2 ring-2 ring-white" />
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-[#E5E1D8] p-3 space-y-2 z-50 animate-in fade-in">
                  <div className="flex items-center justify-between pb-2 border-b border-[#ECE8E0]">
                    <span className="text-xs font-bold text-[#18181B]">{company.name} Signals</span>
                    <span className="text-[10px] text-[#71717A]">Real-time</span>
                  </div>
                  <div className="space-y-1.5 max-h-64 overflow-y-auto">
                    {notificationsList.map((n) => (
                      <div
                        key={n.id}
                        onClick={() => {
                          setShowNotifications(false);
                          handleSelectProblem(n.problemId);
                        }}
                        className="p-2 rounded-lg hover:bg-[#FBF9F5] cursor-pointer text-xs space-y-0.5 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-[#18181B] truncate">{n.title}</span>
                          <span className="text-[10px] text-[#71717A]">{n.time}</span>
                        </div>
                        <p className="text-[11px] text-[#71717A] line-clamp-1">{n.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Return to Landing / Overview */}
            <button
              onClick={onNavigateLanding}
              className="h-9 px-3 rounded-lg border border-[#E5E1D8] text-xs font-semibold text-[#18181B] hover:bg-[#F4F1EA] transition-colors hidden sm:flex items-center gap-1.5"
            >
              <span>Overview</span>
            </button>
          </div>
        </header>

        {/* Scrollable Main Workspace Stage */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-[1360px] mx-auto">
            {/* View Selector Controller */}
            {selectedProblemId ? (
              <ProblemDetailView
                problemId={selectedProblemId}
                company={company}
                onBack={handleBackToProblems}
                onSelectFeedback={handleSelectFeedback}
                onOpenCreateAction={(prob) => handleOpenCreateAction(prob)}
              />
            ) : (
              <>
                {(activeNav === "dashboard" || activeNav === "home" || activeNav === "dashboards") && (
                  <HomeView
                    company={company}
                    onSelectProblem={handleSelectProblem}
                    onSelectFeedback={handleSelectFeedback}
                    onNavigate={(nav) => handleNavClick(nav)}
                  />
                )}
                {activeNav === "problems" && (
                  <ProblemsView onSelectProblem={handleSelectProblem} company={company} />
                )}
                {activeNav === "insights" && (
                  <InsightsView
                    onSelectProblem={handleSelectProblem}
                    onSelectFeedback={handleSelectFeedback}
                    company={company}
                  />
                )}
                {activeNav === "trends" && (
                  <TrendsView onSelectProblem={handleSelectProblem} company={company} />
                )}
                {activeNav === "feedback" && (
                  <FeedbackView onSelectFeedback={handleSelectFeedback} company={company} />
                )}
                {activeNav === "sources" && (
                  <SourcesView
                    onOpenConnectSource={() => setIsConnectSourceOpen(true)}
                    company={company}
                  />
                )}
                {activeNav === "recommendations" && (
                  <RecommendationsView
                    onSelectProblem={handleSelectProblem}
                    onOpenCreateAction={(prob) => handleOpenCreateAction(prob)}
                    company={company}
                  />
                )}
                {activeNav === "actions" && (
                  <ActionsView onSelectProblem={handleSelectProblem} company={company} />
                )}
                {activeNav === "settings" && <SettingsView company={company} />}
              </>
            )}
          </div>
        </main>
      </div>

      {/* ─── MODALS & DRAWERS ─── */}
      <CommandPaletteModal
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onSelectProblem={handleSelectProblem}
        onSelectFeedback={(fb) => setSelectedFeedback(fb)}
        onOpenAskAI={(prompt) => handleOpenAskAI(prompt)}
      />

      <AskAIModal
        isOpen={isAskAIOpen}
        initialQuery={askAIInitialQuery}
        onClose={() => setIsAskAIOpen(false)}
        onOpenProblem={handleSelectProblem}
        onOpenFeedbackList={() => {
          setSelectedProblemId(null);
          setActiveNav("feedback");
        }}
      />

      <ConnectSourceModal
        isOpen={isConnectSourceOpen}
        onClose={() => setIsConnectSourceOpen(false)}
        onSourceConnected={(newSrc) => {
          setActiveNav("sources");
        }}
      />

      <CreateActionModal
        isOpen={isCreateActionOpen}
        problem={actionTargetProblem}
        onClose={() => setIsCreateActionOpen(false)}
        onActionCreated={(newAct) => {
          if (company.actions) {
            company.actions.unshift(newAct);
          } else {
            ACTIONS.unshift(newAct);
          }
          setActiveNav("actions");
        }}
      />

      <FeedbackDetailDrawer
        isOpen={!!selectedFeedback}
        feedback={selectedFeedback}
        onClose={() => setSelectedFeedback(null)}
        onSelectProblem={handleSelectProblem}
      />
    </div>
  );
}
