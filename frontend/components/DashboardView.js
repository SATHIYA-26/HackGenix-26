"use client";

import { useState } from "react";
import TimelineChart from "./TimelineChart";

export default function DashboardView({
  isActive,
  currentAccount,
  onOpenSyncModal,
}) {
  const [activeLocation, setActiveLocation] = useState("All");
  const [activeSentiment, setActiveSentiment] = useState("all");
  const [activeTheme, setActiveTheme] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  if (!currentAccount) return null;

  const handleFilterByTheme = (themeName) => {
    setActiveTheme((prev) => (prev === themeName ? "all" : themeName));
  };

  const items = currentAccount.feedbackItems || [];

  const filteredItems = items.filter((item) => {
    if (
      activeLocation !== "All" &&
      item.branch &&
      !activeLocation.includes(item.branch) &&
      !item.branch.includes(activeLocation)
    ) {
      if (!activeLocation.startsWith("All")) return false;
    }
    if (activeSentiment !== "all" && item.sentiment !== activeSentiment) return false;
    if (activeTheme !== "all" && item.theme !== activeTheme) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase().trim();
      const matchText = (item.text || "").toLowerCase().includes(q);
      const matchAuthor = (item.author_name || "").toLowerCase().includes(q);
      const matchBranch = (item.branch || "").toLowerCase().includes(q);
      if (!matchText && !matchAuthor && !matchBranch) return false;
    }
    return true;
  });

  return (
    <section id="dashboardView" className={`view-section ${isActive ? "active" : ""}`}>
      <div className="dashboard-wrapper">
        {/* Top Active Business Banner */}
        <div className="dash-header-card">
          <div className="dash-header-left">
            <img
              id="dashAvatar"
              src={
                currentAccount.avatar ||
                "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=120"
              }
              className="dash-avatar"
              alt="Avatar"
            />
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <h2 id="dashAccountName" className="dash-title">
                  {currentAccount.name}
                </h2>
                <span id="dashTypeBadge" className={`cm-src-badge ${currentAccount.type}`}>
                  {currentAccount.typeLabel}
                </span>
              </div>
              <div className="dash-meta-row">
                <span id="dashHandle">{currentAccount.handle}</span>
                <span>•</span>
                <span id="dashCategory">{currentAccount.category}</span>
                <span>•</span>
                <span id="dashTotalReviews">{currentAccount.totalReviews} Total Feedback</span>
              </div>
            </div>
          </div>

          <div className="dash-header-actions">
            {/* Branch / Video / Version Selector */}
            <select
              id="locationSelect"
              className="dash-select"
              value={activeLocation}
              onChange={(e) => setActiveLocation(e.target.value)}
            >
              {currentAccount.locations?.map((loc) => (
                <option key={loc} value={loc}>
                  {loc}
                </option>
              ))}
            </select>
            <button className="cm-btn cm-btn-white">Last 30 Days</button>
            <button onClick={onOpenSyncModal} className="cm-btn cm-btn-primary">
              + Live Sync
            </button>
          </div>
        </div>

        {/* Executive KPI Cards */}
        <div className="cm-kpi-grid">
          <div className="cm-kpi-card">
            <span className="cm-kpi-label" id="kpiLabel1">
              Net Sentiment Score
            </span>
            <div className="cm-kpi-val-row">
              <span className="cm-kpi-val" id="kpiVal1">
                {currentAccount.metrics.netSentiment}
              </span>
              <span className="cm-kpi-trend positive" id="kpiTrend1">
                ▲ {currentAccount.metrics.netSentimentDelta}
              </span>
            </div>
            <span className="cm-kpi-footer" id="kpiFooter1">
              Across {currentAccount.totalReviews} verified customer reviews
            </span>
          </div>

          <div className="cm-kpi-card">
            <span className="cm-kpi-label" id="kpiLabel2">
              Total Ingested Feedback
            </span>
            <div className="cm-kpi-val-row">
              <span className="cm-kpi-val" id="kpiVal2">
                {currentAccount.metrics.totalFeedback}
              </span>
              <span className="cm-kpi-trend positive" id="kpiTrend2">
                ▲ {currentAccount.metrics.totalFeedbackDelta}
              </span>
            </div>
            <span className="cm-kpi-footer" id="kpiFooter2">
              Across {currentAccount.locations?.length || 4}{" "}
              {currentAccount.type === "youtube" ? "Videos" : "Google Maps Branches"}
            </span>
          </div>

          <div className="cm-kpi-card">
            <span className="cm-kpi-label" id="kpiLabel3">
              {currentAccount.primaryMetricLabel}
            </span>
            <div className="cm-kpi-val-row">
              <span className="cm-kpi-val" id="kpiVal3" style={{ color: "var(--sentiment-pos)" }}>
                {currentAccount.primaryMetricValue}
              </span>
              <span className="cm-kpi-trend positive" id="kpiTrend3">
                {currentAccount.primaryMetricTrend}
              </span>
            </div>
            <span className="cm-kpi-footer" id="kpiFooter3">
              {currentAccount.positivePct}% Pos · {currentAccount.neutralPct}% Neu · {currentAccount.negativePct}% Neg
            </span>
          </div>

          <div className="cm-kpi-card">
            <span className="cm-kpi-label" id="kpiLabel4">
              Active AI Themes
            </span>
            <div className="cm-kpi-val-row">
              <span className="cm-kpi-val" id="kpiVal4" style={{ color: "#7C3AED" }}>
                {currentAccount.metrics.activeThemes}
              </span>
              <span className="cm-kpi-trend positive">5 High Impact</span>
            </div>
            <span className="cm-kpi-footer" id="kpiFooter4">
              Automated topic clustering & discovery
            </span>
          </div>
        </div>

        {/* Analytics Row: Chart + Reviewr AI Themes */}
        <div className="cm-analytics-grid">
          {/* Chart */}
          <div className="cm-card">
            <div>
              <h3 className="cm-card-title">Customer Sentiment & Volume Trajectory</h3>
              <p className="cm-card-desc">Weekly distribution of customer feedback across sentiment tiers</p>
            </div>
            <TimelineChart accountType={currentAccount.type} />
          </div>

          {/* AI Themes */}
          <div className="cm-card">
            <div>
              <h3 className="cm-card-title">Reviewr AI Themes & Topics</h3>
              <p className="cm-card-desc">Click any theme below to filter customer reviews</p>
            </div>
            <div id="themesContainer" className="cm-themes-list">
              {currentAccount.themes?.map((theme) => {
                const isSelected = activeTheme === theme.name;
                const isPosTrend = theme.trend.startsWith("+");
                return (
                  <div
                    key={theme.name}
                    className={`cm-theme-item ${isSelected ? "active" : ""}`}
                    onClick={() => handleFilterByTheme(theme.name)}
                  >
                    <div className="cm-theme-left">
                      <span className={`cm-theme-dot ${theme.sentiment}`}></span>
                      <span className="cm-theme-name">{theme.name}</span>
                    </div>
                    <div className="cm-theme-meta">
                      <span className="cm-theme-count">{theme.count.toLocaleString()} mentions</span>
                      <span className={`cm-theme-trend ${isPosTrend ? "pos" : "neg"}`}>{theme.trend}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* AI Recommendation Engine */}
        <div>
          <div style={{ marginBottom: "14px" }}>
            <h3 className="cm-card-title">Reviewr AI Recommendation Engine</h3>
            <p className="cm-card-desc">
              Synthesized operational improvements and friction alerts based on customer feedback
            </p>
          </div>
          <div id="insightsContainer" className="cm-insights-grid">
            {currentAccount.insights?.map((insight, idx) => (
              <div key={idx} className="cm-insight-card">
                <span className={`cm-insight-tag ${insight.type}`}>{insight.badge}</span>
                <h4 className="cm-insight-title">{insight.title}</h4>
                <p className="cm-insight-desc">{insight.description}</p>
                <div className="cm-insight-footer">
                  <span className="cm-theme-tag">{insight.theme}</span>
                  <span style={{ fontWeight: 700, color: "var(--text-dark)" }}>{insight.impact}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Reviews Feed Explorer */}
        <div className="cm-feed-section" id="feed">
          <div className="cm-feed-toolbar">
            <div>
              <h3 className="cm-card-title">All Customer Reviews & Feedback</h3>
              <p className="cm-card-desc" id="feedCountDisplay">
                Showing {filteredItems.length} verified customer feedback items for {currentAccount.name}
              </p>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "14px", flexWrap: "wrap" }}>
              {/* Sentiment Filters */}
              <div className="cm-tab-group">
                <button
                  className={`cm-tab-btn sentiment-filter-tab ${activeSentiment === "all" ? "active" : ""}`}
                  data-sentiment="all"
                  onClick={() => setActiveSentiment("all")}
                >
                  All
                </button>
                <button
                  className={`cm-tab-btn sentiment-filter-tab ${activeSentiment === "positive" ? "active" : ""}`}
                  data-sentiment="positive"
                  style={{ color: "var(--sentiment-pos)" }}
                  onClick={() => setActiveSentiment("positive")}
                >
                  Positive
                </button>
                <button
                  className={`cm-tab-btn sentiment-filter-tab ${activeSentiment === "neutral" ? "active" : ""}`}
                  data-sentiment="neutral"
                  style={{ color: "var(--sentiment-neu)" }}
                  onClick={() => setActiveSentiment("neutral")}
                >
                  Neutral
                </button>
                <button
                  className={`cm-tab-btn sentiment-filter-tab ${activeSentiment === "negative" ? "active" : ""}`}
                  data-sentiment="negative"
                  style={{ color: "var(--sentiment-neg)" }}
                  onClick={() => setActiveSentiment("negative")}
                >
                  Negative
                </button>
              </div>

              {/* Search */}
              <div className="cm-search-box">
                <span className="cm-search-icon">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                </span>
                <input
                  type="text"
                  id="feedbackSearch"
                  className="cm-search-input"
                  placeholder="Search review text, branch, keywords..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Feedback Cards List */}
          <div id="feedbackFeedContainer" className="cm-feed-list">
            {filteredItems.length === 0 ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "48px",
                  color: "var(--text-muted)",
                  background: "var(--bg-subtle)",
                  borderRadius: "var(--radius-md)",
                }}
              >
                <p style={{ fontSize: "1.05rem", fontWeight: 600, color: "var(--text-dark)", marginBottom: "4px" }}>
                  No feedback matching criteria
                </p>
                <p style={{ fontSize: "0.85rem" }}>
                  Try resetting search keywords, location filters, or theme selection.
                </p>
              </div>
            ) : (
              filteredItems.map((item) => {
                const formattedDate = new Date(item.created_at).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                });
                const hasReplies = item.replies && item.replies.length > 0;
                const sourceLabel = item.source ? item.source.replace("_", " ") : "Review";

                return (
                  <div key={item.id} className="cm-feedback-card">
                    <div className="cm-fb-header">
                      <div className="cm-author-box">
                        <img
                          src={
                            item.author_avatar ||
                            "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100"
                          }
                          className="cm-author-avatar"
                          alt={item.author_name}
                        />
                        <div>
                          <div className="cm-author-name">{item.author_name}</div>
                          <div className="cm-fb-date">{formattedDate}</div>
                        </div>
                      </div>
                      <div className="cm-fb-badges">
                        {item.branch && <span className="cm-branch-tag">{item.branch}</span>}
                        {item.rating && <span className="cm-stars-badge">{item.rating} ★</span>}
                        <span className={`cm-src-badge ${item.source}`}>{sourceLabel}</span>
                        <span className={`cm-sentiment-badge ${item.sentiment}`}>
                          <span className={`cm-theme-dot ${item.sentiment}`}></span>
                          {item.sentiment?.toUpperCase()}
                        </span>
                      </div>
                    </div>

                    <p className="cm-fb-text">{item.text}</p>

                    <div className="cm-fb-footer">
                      <span className="cm-theme-tag">{item.theme || "General Feedback"}</span>
                      <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                        {item.metadata && item.metadata.like_count !== undefined && (
                          <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                            {item.metadata.like_count} likes
                          </span>
                        )}
                        {hasReplies && (
                          <span style={{ color: "var(--text-muted)", fontWeight: 600, fontSize: "0.8rem" }}>
                            {item.replies.length} {item.replies.length === 1 ? "reply" : "replies"}
                          </span>
                        )}
                        {item.source_url && (
                          <a
                            href={item.source_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              color: "var(--accent-indigo)",
                              textDecoration: "none",
                              fontWeight: 600,
                              fontSize: "0.82rem",
                            }}
                          >
                            View Review ↗
                          </a>
                        )}
                      </div>
                    </div>

                    {hasReplies && (
                      <div
                        style={{
                          background: "var(--bg-subtle)",
                          borderLeft: "2px solid var(--text-dark)",
                          borderRadius: "6px",
                          padding: "10px 14px",
                          marginTop: "4px",
                          display: "flex",
                          flexDirection: "column",
                          gap: "4px",
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--text-dark)" }}>
                            Response from {item.replies[0].author_name}
                          </span>
                        </div>
                        <p style={{ fontSize: "0.86rem", color: "var(--text-body)", margin: 0 }}>
                          {item.replies[0].text}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
