"use client";

import { useState } from "react";
import { Check, X, Sparkles, ArrowRight, ShieldCheck, Star } from "lucide-react";
import { HERO_FINANCIAL_MODELS } from "../lib/mockData";

export default function LandingView({ isActive, onOpenDemoModal, onScrollToSection }) {
  const [timeframe, setTimeframe] = useState("90d");
  const [activePlatformTab, setActivePlatformTab] = useState("data");

  const currentFinancialModel = HERO_FINANCIAL_MODELS[timeframe] || HERO_FINANCIAL_MODELS["90d"];

  return (
    <section id="landingView" className={`view-section ${isActive ? "active" : ""}`}>
      {/* Background YouTube Video Stream (Runs only on Home Landing Page, not in Dashboard) */}
      {isActive && (
        <div className="landing-bg-video-container" aria-hidden="true">
          <iframe
            className="landing-bg-video-iframe"
            src="https://www.youtube-nocookie.com/embed/eYBEJBfq_Zs?autoplay=1&mute=1&loop=1&playlist=eYBEJBfq_Zs&controls=0&showinfo=0&rel=0&iv_load_policy=3&modestbranding=1&playsinline=1&enablejsapi=1"
            title="Background Tech Stream"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            tabIndex="-1"
          />
          <div className="landing-bg-video-overlay" />
        </div>
      )}

      <div className="landing-wrapper">
        {/* Hero Section */}
        <div className="landing-hero">
          <h1 className="landing-hero-title">
            Turn fragmented customer reviews into <em>verified product intelligence</em>.
          </h1>

          <p className="landing-hero-sub">
            The unified customer voice platform for multi-location Google Maps businesses, YouTube creators, and mobile
            apps. Automatically discover emerging sentiment themes, track branch ratings, and trigger actionable
            operational improvements.
          </p>

          {/* Live VoC Revenue & Financial Growth Graph Animation */}
          <div className="hero-roi-container">
            <div className="hero-roi-card">
              {/* Top Controls & Live Pulse */}
              <div className="roi-header centered">
                <div className="roi-header-spacer"></div>
                <span className="roi-header-title">The trust that we have captured</span>
                <div className="roi-timeframe-selector">
                  <button
                    className={`roi-tf-btn ${timeframe === "30d" ? "active" : ""}`}
                    onClick={() => setTimeframe("30d")}
                  >
                    30D
                  </button>
                  <button
                    className={`roi-tf-btn ${timeframe === "90d" ? "active" : ""}`}
                    onClick={() => setTimeframe("90d")}
                  >
                    90D
                  </button>
                  <button
                    className={`roi-tf-btn ${timeframe === "1y" ? "active" : ""}`}
                    onClick={() => setTimeframe("1y")}
                  >
                    Annual YoY
                  </button>
                </div>
              </div>

              {/* 3 Key Metric Blocks with Money/Growth Counters */}
              <div className="roi-metrics-grid">
                <div className="roi-metric-item">
                  <div className="roi-metric-label">
                    <span>Net Revenue Lift</span>
                    <span className="roi-tag-pos">{currentFinancialModel.revenueLift}</span>
                  </div>
                  <div className="roi-metric-val" id="heroMetricRevenue">
                    {currentFinancialModel.revenue}
                  </div>
                  <div className="roi-metric-sub">Attributed to proactive VoC issue resolution</div>
                </div>

                <div className="roi-metric-item">
                  <div className="roi-metric-label">
                    <span>Customer Churn Prevented</span>
                    <span className="roi-tag-pos">{currentFinancialModel.churnRate}</span>
                  </div>
                  <div className="roi-metric-val" id="heroMetricChurn">
                    {currentFinancialModel.churn}
                  </div>
                  <div className="roi-metric-sub">Negative review escalations deflected</div>
                </div>

                <div className="roi-metric-item">
                  <div className="roi-metric-label">
                    <span>VoC ROI Multiplier</span>
                    <span className="roi-tag-violet">{currentFinancialModel.roi} Return</span>
                  </div>
                  <div className="roi-metric-val" id="heroMetricRoi">
                    {currentFinancialModel.roi}
                  </div>
                  <div className="roi-metric-sub">₹1 invested = ₹14.80 retained business value</div>
                </div>
              </div>

              {/* Dynamic Animated Graph Stage */}
              <div className="roi-graph-stage">
                {/* Background Grid */}
                <div className="roi-graph-grid">
                  <div className="roi-grid-line">
                    <span>₹30L</span>
                  </div>
                  <div className="roi-grid-line">
                    <span>₹20L</span>
                  </div>
                  <div className="roi-grid-line">
                    <span>₹10L</span>
                  </div>
                  <div className="roi-grid-line">
                    <span>₹0L</span>
                  </div>
                </div>

                {/* Animated SVG Curve */}
                <svg className="roi-svg-canvas" viewBox="0 0 900 240" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="roiGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="rgba(16, 185, 129, 0.35)" />
                      <stop offset="100%" stopColor="rgba(16, 185, 129, 0.0)" />
                    </linearGradient>
                    <linearGradient id="roiLineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#3B82F6" />
                      <stop offset="40%" stopColor="#7C3AED" />
                      <stop offset="100%" stopColor="#10B981" />
                    </linearGradient>
                    <filter id="roiGlow" x="-20%" y="-20%" width="140%" height="140%">
                      <feGaussianBlur stdDeviation="4" result="glow" />
                      <feComposite in="SourceGraphic" in2="glow" operator="over" />
                    </filter>
                  </defs>
                  {/* Area Fill */}
                  <path
                    id="heroAreaPath"
                    className="roi-area-path"
                    d={currentFinancialModel.areaD}
                    fill="url(#roiGradient)"
                  />
                  {/* Animated Line */}
                  <path
                    key={timeframe}
                    id="heroLinePath"
                    className="roi-line-path"
                    d={currentFinancialModel.lineD}
                    fill="none"
                    stroke="url(#roiLineGrad)"
                    strokeWidth="4.5"
                    strokeLinecap="round"
                    filter="url(#roiGlow)"
                  />

                  {/* Pulsing Nodes along the trajectory */}
                  <g className="roi-node" transform="translate(180, 180)">
                    <circle r="7" className="roi-node-pulse" fill="#3B82F6" />
                    <circle r="4.5" fill="#FFFFFF" stroke="#3B82F6" strokeWidth="2.5" />
                  </g>
                  <g className="roi-node" transform="translate(480, 115)">
                    <circle r="7" className="roi-node-pulse" fill="#7C3AED" />
                    <circle r="4.5" fill="#FFFFFF" stroke="#7C3AED" strokeWidth="2.5" />
                  </g>
                  <g className="roi-node" transform="translate(870, 30)">
                    <circle r="8" className="roi-node-pulse" fill="#10B981" />
                    <circle r="5" fill="#FFFFFF" stroke="#10B981" strokeWidth="3" />
                  </g>
                </svg>

                {/* Interactive Milestone Annotations */}
                <div className="roi-milestone m-left">
                  <div className="m-text">
                    <strong>Food Quality Alert Solved</strong>
                    <small>+₹3.2L Recurring Saved</small>
                  </div>
                </div>

                <div className="roi-milestone m-mid">
                  <div className="m-text">
                    <strong>Queue Bottleneck Fixed</strong>
                    <small>+₹8.5L Branch Lift</small>
                  </div>
                </div>

                <div className="roi-milestone m-right">
                  <div className="m-text">
                    <strong>Loyalty Surge</strong>
                    <small>+₹24.8L ARR Peak</small>
                  </div>
                </div>

                {/* Floating Live Ticker Chips with micro animations */}
                <div className="roi-floating-chip chip-1">
                  <span className="chip-dot"></span>
                  <span>
                    <strong>+₹45,000/wk</strong> saved on spice feedback
                  </span>
                </div>
                <div className="roi-floating-chip chip-2">
                  <span className="chip-dot" style={{ background: "#7C3AED" }}></span>
                  <span>
                    <strong>NPS +38 pts</strong> ➔ +18.4% Repeat Orders
                  </span>
                </div>
              </div>

              {/* Bottom Live Event Activity Bar */}
              <div className="roi-footer-ticker">
                <span className="ticker-label">LIVE FINANCIAL SIGNALS:</span>
                <div className="ticker-marquee">
                  <div className="ticker-track" id="roiTickerTrack">
                    <span className="ticker-item">
                      • Mani's Dum Biriyani: Brinjal Curry recipe tweak saved{" "}
                      <strong>+₹92,400</strong> in churned orders
                    </span>
                    <span className="ticker-item">
                      • Chepauk Sports: English Willow bat stock alert recovered{" "}
                      <strong>+₹1,85,000</strong> in lost sales
                    </span>
                    <span className="ticker-item">
                      • H&M Mylapore: Trial room queue fix boosted footfall conversion by{" "}
                      <strong>+14.2%</strong>
                    </span>
                    <span className="ticker-item">
                      • VJ Sidhu Vlogs: Audio mic adjustment increased sponsor retention by{" "}
                      <strong>+28.0%</strong>
                    </span>
                    <span className="ticker-item">
                      • Spotify: Tamil playlist shuffle algorithm patch recovered{" "}
                      <strong>+12,400</strong> premium renewals
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION: WHAT WE DO */}
          <div className="landing-section-block" id="whatWeDoSection">
            <div className="landing-section-title-wrap">
              <span className="landing-section-tag">What We Do · Made Simple</span>
              <h2 className="landing-section-title">We Turn Customer Feedback Into More Revenue</h2>
              <p className="cm-section-desc">
                Thousands of reviews are written about your business every week. We make it dead simple to understand
                what customers love, what makes them angry, and how to fix it immediately.
              </p>
            </div>

            {/* 3 Simple Pillars */}
            <div className="what-we-do-grid">
              {/* Step 1 */}
              <div className="wwd-card">
                <div className="wwd-badge-row">
                  <div className="wwd-step-pill">Step 1</div>
                  <div className="wwd-icon-circle" style={{ background: "rgba(59, 130, 246, 0.15)", color: "#60A5FA" }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="7 10 12 15 17 10" />
                      <line x1="12" y1="15" x2="12" y2="3" />
                    </svg>
                  </div>
                </div>
                <h3 className="wwd-title">1. Connect & Ingest</h3>
                <p className="wwd-desc">
                  Auto-sync all reviews from Google Maps, YouTube comments, and App Stores in real-time — zero manual
                  spreadsheets.
                </p>
              </div>

              {/* Step 2 */}
              <div className="wwd-card">
                <div className="wwd-badge-row">
                  <div
                    className="wwd-step-pill"
                    style={{ background: "rgba(124, 58, 237, 0.15)", color: "#C084FC", borderColor: "rgba(124, 58, 237, 0.35)" }}
                  >
                    Step 2
                  </div>
                  <div className="wwd-icon-circle" style={{ background: "rgba(124, 58, 237, 0.15)", color: "#C084FC" }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" />
                      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                      <line x1="12" y1="17" x2="12.01" y2="17" />
                    </svg>
                  </div>
                </div>
                <h3 className="wwd-title">2. AI Sentiment Analysis</h3>
                <p className="wwd-desc">
                  AI reads every sentence to pinpoint what customers love (food taste, service) and what annoys them
                  (queue, bugs).
                </p>
              </div>

              {/* Step 3 */}
              <div className="wwd-card">
                <div className="wwd-badge-row">
                  <div
                    className="wwd-step-pill"
                    style={{ background: "rgba(16, 185, 129, 0.15)", color: "#34D399", borderColor: "rgba(16, 185, 129, 0.35)" }}
                  >
                    Step 3
                  </div>
                  <div className="wwd-icon-circle" style={{ background: "rgba(16, 185, 129, 0.15)", color: "#34D399" }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                    </svg>
                  </div>
                </div>
                <h3 className="wwd-title">3. Fix & Grow Revenue</h3>
                <p className="wwd-desc">
                  Get clear priority fixes to stop customer churn, protect 5-star ratings, and drive repeat business
                  revenue.
                </p>
              </div>
            </div>

            {/* Real-World Example Comparison Card */}
            <div className="wwd-example-card">
              <div className="wwd-example-header">
                <span className="wwd-example-tag">REAL LIFE EXAMPLE</span>
                <h3 className="wwd-example-title">How Reviewr understands a mixed customer review</h3>
              </div>

              <div className="wwd-review-sample">
                <span className="wwd-quote-icon">“</span>
                <p className="wwd-quote-text">
                  The biryani was <mark className="pos-highlight">super flavorful and tender</mark>, but we had to{" "}
                  <mark className="neg-highlight">wait 45 minutes for a table</mark> and the{" "}
                  <mark className="neg-highlight">car parking was full</mark>.
                </p>
                <span className="wwd-sample-author">— Real Google Maps Customer (Rated 3 ★)</span>
              </div>

              <div className="wwd-breakdown-grid">
                <div className="wwd-breakdown-col before">
                  <div className="wwd-col-header">
                    <span className="col-icon text-[#E11D48] flex items-center justify-center">
                      <X className="w-4 h-4" />
                    </span>
                    <strong>What Traditional Tools See:</strong>
                  </div>
                  <div className="wwd-col-body">
                    <p>
                      Just counts as a generic <strong>"3.0 Star Rating"</strong>. The manager has no idea what went wrong
                      or what went right.
                    </p>
                  </div>
                </div>

                <div className="wwd-breakdown-col after">
                  <div className="wwd-col-header">
                    <span className="col-icon text-[#059669] flex items-center justify-center">
                      <Check className="w-4 h-4" />
                    </span>
                    <strong>What Reviewr AI Instantly Does:</strong>
                  </div>
                  <div className="wwd-col-body">
                    <div className="wwd-aspect-tag-list">
                      <span className="aspect-badge pos">Taste & Meat Quality: +94% (High Delight)</span>
                      <span className="aspect-badge neg">Waiting Queue Time: -88% (Operational Bottleneck)</span>
                      <span className="aspect-badge neg">Parking Facility: -72% (Location Friction)</span>
                    </div>
                    <div className="wwd-action-callout">
                      <strong>Action Alert:</strong>{" "}
                      <em>"Add weekend queue pager system to save an estimated ₹1.8L/month in walkaways."</em>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION: INTERACTIVE PLATFORM SHOWCASE */}
        <div className="platform-showcase-wrapper">
          <div className="platform-showcase-card">
            {/* Top Main Tabs Navigation */}
            <div className="platform-tabs-nav">
              <button
                className={`pf-tab-btn ${activePlatformTab === "agent" ? "active" : ""}`}
                onClick={() => setActivePlatformTab("agent")}
              >
                Agent
              </button>
              <button
                className={`pf-tab-btn ${activePlatformTab === "data" ? "active" : ""}`}
                onClick={() => setActivePlatformTab("data")}
              >
                Data
              </button>
              <button
                className={`pf-tab-btn ${activePlatformTab === "intelligence" ? "active" : ""}`}
                onClick={() => setActivePlatformTab("intelligence")}
              >
                Intelligence
              </button>
              <button
                className={`pf-tab-btn ${activePlatformTab === "program" ? "active" : ""}`}
                onClick={() => setActivePlatformTab("program")}
              >
                Program
              </button>
            </div>

            {/* Tab Content Panes */}
            <div className="platform-pane-container">
              {/* Pane 1: DATA */}
              <div id="pfPaneData" className={`pf-pane ${activePlatformTab === "data" ? "active" : ""}`}>
                <div className="pf-split-layout">
                  <div className="pf-left-content">
                    <h2 className="pf-hero-title">Consolidate all your feedback in one powerful platform</h2>
                    <p className="pf-hero-desc">
                      Centralize feedback from every single channel. Get a unified view of your entire customer experience
                      and understand the true voice of the customer.
                    </p>
                    <a
                      href="#pipelineSection"
                      className="pf-action-link"
                      onClick={(e) => {
                        e.preventDefault();
                        onScrollToSection("pipelineSection");
                      }}
                    >
                      See every integration <span>→</span>
                    </a>
                  </div>

                  <div className="pf-right-stage">
                    <div className="pf-stage-grid-bg">
                      <div className="pf-integration-icons-grid">
                        <div className="pf-app-icon" title="Google Maps">
                          <img src="https://www.gstatic.com/images/branding/product/2x/maps_64dp.png" alt="Google Maps" />
                        </div>
                        <div className="pf-app-icon dark" title="Zendesk">
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="#FFFFFF">
                            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                          </svg>
                        </div>
                        <div className="pf-app-icon dark" title="Salesforce">
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="#FFFFFF">
                            <path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96z" />
                          </svg>
                        </div>
                        <div className="pf-app-icon dark" title="Instagram">
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2">
                            <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                            <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                            <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                          </svg>
                        </div>
                        <div className="pf-app-icon dark" title="Qualtrics XM">
                          <span style={{ fontWeight: 800, fontSize: "0.9rem", color: "#FFFFFF" }}>XM</span>
                        </div>
                        <div className="pf-app-icon" title="YouTube">
                          <img
                            src="https://www.gstatic.com/youtube/img/branding/favicon/favicon_144x144.png"
                            alt="YouTube"
                          />
                        </div>
                        <div className="pf-app-icon dark" title="Play Store">
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="#FFFFFF">
                            <polygon points="5 3 19 12 5 21 5 3" />
                          </svg>
                        </div>
                        <div className="pf-app-icon dark" title="Reviewr Intelligence">
                          <span style={{ fontWeight: 900, fontSize: "1.1rem", color: "#FFFFFF" }}>M</span>
                        </div>
                      </div>

                      <div className="pf-mock-insight-card">
                        <div className="pf-mock-header">
                          <span className="pf-mock-tag">TOP REASONS FOR NEGATIVITY</span>
                          <span className="pf-mock-time">Last 14 Days</span>
                        </div>

                        <div className="pf-mock-bars-list">
                          <div className="pf-bar-row">
                            <span className="pf-bar-label">Confusing filters</span>
                            <div className="pf-bar-track">
                              <div className="pf-bar-fill rose" style={{ width: "78%" }}></div>
                            </div>
                            <span className="pf-bar-count">263</span>
                          </div>

                          <div className="pf-bar-row">
                            <span className="pf-bar-label">Unavailable tickets</span>
                            <div className="pf-bar-track">
                              <div className="pf-bar-fill blue" style={{ width: "58%" }}></div>
                            </div>
                            <span className="pf-bar-count">194</span>
                          </div>

                          <div className="pf-bar-row">
                            <span className="pf-bar-label">Error when paying</span>
                            <div className="pf-bar-track">
                              <div className="pf-bar-fill slate" style={{ width: "42%" }}></div>
                            </div>
                            <span className="pf-bar-count">137</span>
                          </div>
                        </div>

                        <div className="pf-summary-box">
                          <div className="pf-summary-heading">
                            <span className="pf-sparkle-icon">✧</span>
                            <span>Summary</span>
                          </div>
                          <p className="pf-summary-text">
                            Customers are experiencing significant frustration with the booking process, citing issues such
                            as confusing filters, payment errors, and unavailability of tickets.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pf-bottom-subtabs">
                  <span className="pf-subtab active">Integrations</span>
                  <span className="pf-subtab">Taxonomy</span>
                  <span className="pf-subtab">Data Enrichment</span>
                  <span className="pf-subtab">Security & Privacy</span>
                </div>
              </div>

              {/* Pane 2: AGENT */}
              <div id="pfPaneAgent" className={`pf-pane ${activePlatformTab === "agent" ? "active" : ""}`}>
                <div className="pf-split-layout">
                  <div className="pf-left-content">
                    <h2 className="pf-hero-title">Meet Reviewr AI, your autonomous customer feedback analyst</h2>
                    <p className="pf-hero-desc">
                      Built to think like a seasoned analyst. Reviewr AI continuously monitors review surges, detects
                      sentiment inflection points, and synthesizes root-cause hypotheses for product teams.
                    </p>
                    <a
                      href="#whatWeDoSection"
                      className="pf-action-link"
                      onClick={(e) => {
                        e.preventDefault();
                        onScrollToSection("whatWeDoSection");
                      }}
                    >
                      Explore AI Agent capabilities <span>→</span>
                    </a>
                  </div>
                  <div className="pf-right-stage">
                    <div className="pf-stage-grid-bg">
                      <div className="pf-mock-insight-card" style={{ position: "static", margin: "24px auto", maxWidth: "440px" }}>
                        <div className="pf-mock-header">
                          <span className="pf-mock-tag" style={{ color: "#7C3AED" }}>
                            AUTONOMOUS AGENT ACTIONS
                          </span>
                          <span className="pf-mock-time">Real-time</span>
                        </div>
                        <div className="pf-summary-box" style={{ background: "rgba(124, 58, 237, 0.15)", border: "1px solid rgba(124, 58, 237, 0.3)" }}>
                          <div className="pf-summary-heading" style={{ color: "#C084FC" }}>
                            <span>Reviewr Agent Report</span>
                          </div>
                          <p className="pf-summary-text" style={{ color: "#E4E4E7" }}>
                            "Identified 34 new 1-star reviews in Chennai related to table queue delays. Suggested operational
                            fix: Deploy weekend pager tokens to reduce walkaways by ₹1.8L/mo."
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="pf-bottom-subtabs">
                  <span className="pf-subtab active">Autonomous Analysis</span>
                  <span className="pf-subtab">Custom Reasoning</span>
                  <span className="pf-subtab">Automated Alerts</span>
                </div>
              </div>

              {/* Pane 3: INTELLIGENCE */}
              <div id="pfPaneIntelligence" className={`pf-pane ${activePlatformTab === "intelligence" ? "active" : ""}`}>
                <div className="pf-split-layout">
                  <div className="pf-left-content">
                    <h2 className="pf-hero-title">Aspect-based sentiment intelligence across every channel</h2>
                    <p className="pf-hero-desc">
                      Deconstruct complex multi-clause reviews into discrete operational topics. Measure customer perception
                      across food tenderness, staff responsiveness, and checkout bugs with sub-second accuracy.
                    </p>
                    <a
                      href="#pipelineSection"
                      className="pf-action-link"
                      onClick={(e) => {
                        e.preventDefault();
                        onScrollToSection("pipelineSection");
                      }}
                    >
                      Explore NLP Sentiment Engine <span>→</span>
                    </a>
                  </div>
                  <div className="pf-right-stage">
                    <div className="pf-stage-grid-bg">
                      <div className="pf-mock-insight-card" style={{ position: "static", margin: "24px auto", maxWidth: "440px" }}>
                        <div className="pf-mock-header">
                          <span className="pf-mock-tag" style={{ color: "#059669" }}>
                            ASPECT POLARITY MATRIX
                          </span>
                          <span className="pf-mock-time">Live Sync</span>
                        </div>
                        <div className="pf-mock-bars-list">
                          <div className="pf-bar-row">
                            <span className="pf-bar-label">Taste & Seasoning</span>
                            <div className="pf-bar-track">
                              <div className="pf-bar-fill" style={{ width: "94%", background: "#10B981" }}></div>
                            </div>
                            <span className="pf-bar-count">+0.94</span>
                          </div>
                          <div className="pf-bar-row">
                            <span className="pf-bar-label">Ambience & Hygiene</span>
                            <div className="pf-bar-track">
                              <div className="pf-bar-fill" style={{ width: "82%", background: "#10B981" }}></div>
                            </div>
                            <span className="pf-bar-count">+0.82</span>
                          </div>
                          <div className="pf-bar-row">
                            <span className="pf-bar-label">Wait Time Friction</span>
                            <div className="pf-bar-track">
                              <div className="pf-bar-fill rose" style={{ width: "76%" }}></div>
                            </div>
                            <span className="pf-bar-count">-0.76</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="pf-bottom-subtabs">
                  <span className="pf-subtab active">Aspect ABSA</span>
                  <span className="pf-subtab">Topic Discovery</span>
                  <span className="pf-subtab">Root Cause Analysis</span>
                </div>
              </div>

              {/* Pane 4: PROGRAM */}
              <div id="pfPaneProgram" className={`pf-pane ${activePlatformTab === "program" ? "active" : ""}`}>
                <div className="pf-split-layout">
                  <div className="pf-left-content">
                    <h2 className="pf-hero-title">Scale feedback intelligence across entire enterprise operations</h2>
                    <p className="pf-hero-desc">
                      Empower regional managers, store owners, and product executives with role-based dashboards, automated
                      weekly digest summaries, and measurable revenue attribution ROI tracking.
                    </p>
                    <a
                      href="#pricingSection"
                      className="pf-action-link"
                      onClick={(e) => {
                        e.preventDefault();
                        onScrollToSection("pricingSection");
                      }}
                    >
                      View Enterprise programs <span>→</span>
                    </a>
                  </div>
                  <div className="pf-right-stage">
                    <div className="pf-stage-grid-bg">
                      <div className="pf-mock-insight-card" style={{ position: "static", margin: "24px auto", maxWidth: "440px" }}>
                        <div className="pf-mock-header">
                          <span className="pf-mock-tag" style={{ color: "#3B82F6" }}>
                            EXECUTIVE VOC PROGRAM
                          </span>
                          <span className="pf-mock-time">Multi-Location</span>
                        </div>
                        <div className="pf-summary-box" style={{ background: "rgba(59, 130, 246, 0.15)", border: "1px solid rgba(59, 130, 246, 0.3)" }}>
                          <div className="pf-summary-heading" style={{ color: "#60A5FA" }}>
                            <span>Program ROI: 14.8x Lift</span>
                          </div>
                          <p className="pf-summary-text" style={{ color: "#E4E4E7" }}>
                            Connected 5 business entities, tracking 32.5M+ customer interactions with zero manual review
                            reading required.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="pf-bottom-subtabs">
                  <span className="pf-subtab active">Executive Dashboards</span>
                  <span className="pf-subtab">Multi-Branch Sync</span>
                  <span className="pf-subtab">Revenue Attribution</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION: THE SOLUTION VS THE PROBLEM */}
        <div className="landing-section-block" id="solutionSection">
          <div className="landing-section-title-wrap">
            <span className="landing-section-tag">Why Reviewr Exists</span>
            <h2 className="landing-section-title">The Feedback Fragmentation Problem & Our Solution</h2>
            <p className="cm-section-desc">
              How Reviewr transforms chaotic, multi-channel customer noise into quantified operational growth.
            </p>
          </div>

          <div className="solution-split-grid">
            {/* The Problem */}
            <div className="solution-card problem-side">
              <div>
                <span className="portal-type-badge youtube" style={{ background: "rgba(225, 29, 72, 0.2)", color: "#FB7185" }}>
                  The Legacy Problem
                </span>
                <h3 className="pipeline-step-title" style={{ marginTop: "10px", fontSize: "1.35rem" }}>
                  Fragmented Customer Feedback Chaos
                </h3>
              </div>

              <div className="solution-list">
                <div className="solution-list-item">
                  <span className="solution-icon-bullet neg">✕</span>
                  <div>
                    <strong>Siloed Data Channels:</strong> Reviews scattered across Google Maps locations, YouTube videos,
                    Play Store versions, and Instagram reels without a central data lake.
                  </div>
                </div>
                <div className="solution-list-item">
                  <span className="solution-icon-bullet neg">✕</span>
                  <div>
                    <strong>Unstructured Text Overload:</strong> Thousands of free-form customer comments with slang,
                    emojis, mixed languages, and nuanced sarcasm that traditional keyword alerts miss.
                  </div>
                </div>
                <div className="solution-list-item">
                  <span className="solution-icon-bullet neg">✕</span>
                  <div>
                    <strong>Zero Branch Attribution:</strong> Executives cannot isolate whether dining delays belong to the
                    T. Nagar branch or Velachery branch without manual reading.
                  </div>
                </div>
                <div className="solution-list-item">
                  <span className="solution-icon-bullet neg">✕</span>
                  <div>
                    <strong>Stale Sentiment Metrics:</strong> Static average star ratings mask emerging operational crises
                    (e.g. food quality dips or software update crashes).
                  </div>
                </div>
              </div>
            </div>

            {/* The Reviewr Solution */}
            <div className="solution-card solution-side">
              <div>
                <span className="portal-type-badge play_store" style={{ background: "rgba(16, 185, 129, 0.2)", color: "#34D399" }}>
                  The Reviewr Solution
                </span>
                <h3 className="pipeline-step-title" style={{ marginTop: "10px", fontSize: "1.35rem" }}>
                  Unified VoC & NLP Intelligence Engine
                </h3>
              </div>

              <div className="solution-list">
                <div className="solution-list-item">
                  <span className="solution-icon-bullet pos">✓</span>
                  <div>
                    <strong>Multi-Source Automated Ingestion:</strong> Official REST API connectors ingest Google Places
                    reviews, YouTube comment threads/replies, and Play Store reviews into a unified schema.
                  </div>
                </div>
                <div className="solution-list-item">
                  <span className="solution-icon-bullet pos">✓</span>
                  <div>
                    <strong>Aspect-Based Sentiment (ABSA):</strong> Sub-sentence polarity scoring decomposes comments into
                    specific attributes (e.g. <em>"Food was great (+0.92)"</em> vs <em>"Waiting queue was slow (-0.78)"</em>).
                  </div>
                </div>
                <div className="solution-list-item">
                  <span className="solution-icon-bullet pos">✓</span>
                  <div>
                    <strong>Reviewr AI Theme Clustering:</strong> Semantic embeddings cluster millions of reviews into
                    real-time operational themes with quantified trajectory curves.
                  </div>
                </div>
                <div className="solution-list-item">
                  <span className="solution-icon-bullet pos">✓</span>
                  <div>
                    <strong>Automated Recommendation Engine:</strong> Discovers delight drivers, alerts branch managers of
                    friction points, and recommends revenue-expanding fixes.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION: HOW WE PROCESS REVIEWS & NLP PIPELINE ARCHITECTURE */}
        <div className="landing-section-block" id="pipelineSection">
          <div className="landing-section-title-wrap">
            <span className="landing-section-tag">End-to-End Processing Architecture</span>
            <h2 className="landing-section-title">How Reviewr Ingests & Processes Unstructured Feedback</h2>
            <p className="cm-section-desc">
              From raw API ingestion to aspect-level sentiment classification and executive action triggers.
            </p>
          </div>

          <div className="pipeline-flow-container">
            <div className="pipeline-step-box">
              <div className="pipeline-step-num">1</div>
              <h3 className="pipeline-step-title">Multi-Source API Fetch</h3>
              <p className="pipeline-step-desc">
                Asynchronous HTTPX client fetches public reviews and nested comment replies via official REST APIs with quota tracking.
              </p>
              <span className="pipeline-step-tag">HTTPX / AsyncIO</span>
            </div>

            <div className="pipeline-step-box">
              <div className="pipeline-step-num">2</div>
              <h3 className="pipeline-step-title">Normalization & Dedup</h3>
              <p className="pipeline-step-desc">
                Standardizes dates, author avatars, star ratings, and enforces composite uniqueness on{" "}
                <code>(business_id, source, external_id)</code>.
              </p>
              <span className="pipeline-step-tag">PostgreSQL JSONB</span>
            </div>

            <div className="pipeline-step-box">
              <div className="pipeline-step-num">3</div>
              <h3 className="pipeline-step-title">NLP Cleaning & Tokens</h3>
              <p className="pipeline-step-desc">
                Strips HTML markup, handles emoji polarity mapping, detects language, and performs lemmatization on review text.
              </p>
              <span className="pipeline-step-tag">NLTK / RegEx</span>
            </div>

            <div className="pipeline-step-box">
              <div className="pipeline-step-num">4</div>
              <h3 className="pipeline-step-title">Aspect-Based Sentiment</h3>
              <p className="pipeline-step-desc">
                VADER and fine-tuned Transformer models calculate continuous polarity (-1.0 to +1.0) and map to Positive,
                Neutral, or Negative tiers.
              </p>
              <span className="pipeline-step-tag">VADER / ABSA</span>
            </div>

            <div className="pipeline-step-box">
              <div className="pipeline-step-num">5</div>
              <h3 className="pipeline-step-title">Themes & Actions</h3>
              <p className="pipeline-step-desc">
                Semantic topic clustering groups feedback into high-impact business themes and synthesizes automated
                operational recommendations.
              </p>
              <span className="pipeline-step-tag">BERTopic & Rules</span>
            </div>
          </div>
        </div>

        {/* SECTION: PRICING PLANS */}
        <div className="landing-section-block" id="pricingSection">
          <div className="landing-section-title-wrap">
            <span className="landing-section-tag">Flexible Plans</span>
            <h2 className="landing-section-title">Transparent Pricing for Every Business Scale</h2>
            <p className="cm-section-desc">
              From independent stores and creator studios to multi-branch restaurant chains and global mobile apps.
            </p>
          </div>

          <div className="pricing-grid">
            {/* 1. Starter */}
            <div className="pricing-card">
              <div>
                <div className="pricing-header">
                  <span className="cm-branch-tag">Creator & Retail</span>
                  <h3 className="pricing-plan-name">Starter Plan</h3>
                  <p style={{ fontSize: "0.85rem", color: "#A1A1AA" }}>
                    Ideal for single stores, local gyms, and YouTube creators.
                  </p>
                </div>
                <div className="pricing-price-row">
                  <span className="pricing-currency">₹</span>
                  <span className="pricing-val">2,999</span>
                  <span className="pricing-period">/ month</span>
                </div>
                <ul className="pricing-features-list" style={{ marginTop: "20px" }}>
                  <li className="pricing-feature-item">
                    <span className="pricing-check">✓</span> Up to 5,000 feedback/mo
                  </li>
                  <li className="pricing-feature-item">
                    <span className="pricing-check">✓</span> 1 Google Maps or YouTube source
                  </li>
                  <li className="pricing-feature-item">
                    <span className="pricing-check">✓</span> Automated sentiment classification
                  </li>
                  <li className="pricing-feature-item">
                    <span className="pricing-check">✓</span> Weekly digest summary email
                  </li>
                </ul>
              </div>
              <button
                onClick={() => onOpenDemoModal("Starter")}
                className="cm-btn cm-btn-outline"
                style={{ width: "100%", marginTop: "20px" }}
              >
                Start Free Trial →
              </button>
            </div>

            {/* 2. Growth (Featured) */}
            <div className="pricing-card featured">
              <div>
                <div className="pricing-header">
                  <span className="cm-branch-tag" style={{ background: "rgba(124, 58, 237, 0.2)", color: "#C084FC" }}>
                    Multi-Branch & Apps
                  </span>
                  <h3 className="pricing-plan-name">Growth Business</h3>
                  <p style={{ fontSize: "0.85rem", color: "#A1A1AA" }}>
                    For multi-location chains like Mani's Biriyani, H&M, and sports stores.
                  </p>
                </div>
                <div className="pricing-price-row">
                  <span className="pricing-currency">₹</span>
                  <span className="pricing-val">9,999</span>
                  <span className="pricing-period">/ month</span>
                </div>
                <ul className="pricing-features-list" style={{ marginTop: "20px" }}>
                  <li className="pricing-feature-item">
                    <span className="pricing-check">✓</span> Up to 50,000 feedback/mo
                  </li>
                  <li className="pricing-feature-item">
                    <span className="pricing-check">✓</span> Up to 10 branch locations / sources
                  </li>
                  <li className="pricing-feature-item">
                    <span className="pricing-check">✓</span> Aspect-Based Sentiment (ABSA)
                  </li>
                  <li className="pricing-feature-item">
                    <span className="pricing-check">✓</span> AI Theme Clustering & Insights
                  </li>
                  <li className="pricing-feature-item">
                    <span className="pricing-check">✓</span> React Native Smartphone Mobile App
                  </li>
                </ul>
              </div>
              <button
                onClick={() => onOpenDemoModal("Growth")}
                className="cm-btn cm-btn-primary"
                style={{ width: "100%", marginTop: "20px" }}
              >
                Get Started with Growth →
              </button>
            </div>

            {/* 3. Enterprise */}
            <div className="pricing-card">
              <div>
                <div className="pricing-header">
                  <span className="cm-branch-tag" style={{ background: "rgba(16, 185, 129, 0.2)", color: "#34D399" }}>
                    Enterprise & Publishers
                  </span>
                  <h3 className="pricing-plan-name">Enterprise Scale</h3>
                  <p style={{ fontSize: "0.85rem", color: "#A1A1AA" }}>
                    For high-volume publishers like Spotify and national retail brands.
                  </p>
                </div>
                <div className="pricing-price-row">
                  <span className="pricing-val" style={{ fontSize: "2rem" }}>
                    Custom
                  </span>
                </div>
                <ul className="pricing-features-list" style={{ marginTop: "20px" }}>
                  <li className="pricing-feature-item">
                    <span className="pricing-check">✓</span> Unlimited reviews & comments
                  </li>
                  <li className="pricing-feature-item">
                    <span className="pricing-check">✓</span> Custom LLM fine-tuning & embeddings
                  </li>
                  <li className="pricing-feature-item">
                    <span className="pricing-check">✓</span> Dedicated Account Manager & 99.9% SLA
                  </li>
                  <li className="pricing-feature-item">
                    <span className="pricing-check">✓</span> Custom Webhooks & ERP integrations
                  </li>
                </ul>
              </div>
              <button
                onClick={() => onOpenDemoModal("Enterprise")}
                className="cm-btn cm-btn-outline"
                style={{ width: "100%", marginTop: "20px" }}
              >
                Talk to Enterprise Team →
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
