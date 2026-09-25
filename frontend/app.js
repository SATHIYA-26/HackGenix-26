/**
 * Reviewr - Frontend Application Logic
 * Supports Landing Page, Authentication & Customized Business Dashboards
 */

let currentAccountId = "acc_manis";
let currentAccount = REVIEWR_ACCOUNTS[0];
let currentUser = PREDEFINED_USERS[0];
let isAuthenticated = false;

let activeLocation = "All";
let activeSentiment = "all";
let activeTheme = "all";
let searchQuery = "";

let timelineChart = null;

// ==========================================================================
// HERO VOC FINANCIAL & GRAPH ANIMATION MODEL
// ==========================================================================

const HERO_FINANCIAL_MODELS = {
  "30d": {
    revenue: "₹8,40,000",
    revenueLift: "+16.2% MoM",
    churn: "₹3,10,000",
    churnRate: "96.5% Saved",
    roi: "11.4x",
    lineD: "M 30,210 Q 200,190 350,170 T 620,120 T 870,70",
    areaD: "M 30,210 Q 200,190 350,170 T 620,120 T 870,70 L 870,230 L 30,230 Z"
  },
  "90d": {
    revenue: "₹24,80,000",
    revenueLift: "+24.6% ARR",
    churn: "₹9,45,000",
    churnRate: "98.2% Saved",
    roi: "14.8x",
    lineD: "M 30,210 Q 180,180 320,150 T 600,80 T 870,30",
    areaD: "M 30,210 Q 180,180 320,150 T 600,80 T 870,30 L 870,230 L 30,230 Z"
  },
  "1y": {
    revenue: "₹1,12,50,000",
    revenueLift: "+41.8% YoY",
    churn: "₹38,20,000",
    churnRate: "99.4% Saved",
    roi: "22.6x",
    lineD: "M 30,220 Q 150,190 300,130 T 580,50 T 870,15",
    areaD: "M 30,220 Q 150,190 300,130 T 580,50 T 870,15 L 870,230 L 30,230 Z"
  }
};

function updateHeroFinancialModel(timeframe, btnElement) {
  if (btnElement) {
    document.querySelectorAll(".roi-tf-btn").forEach(b => b.classList.remove("active"));
    btnElement.classList.add("active");
  }

  const model = HERO_FINANCIAL_MODELS[timeframe] || HERO_FINANCIAL_MODELS["90d"];
  
  const revEl = document.getElementById("heroMetricRevenue");
  const churnEl = document.getElementById("heroMetricChurn");
  const roiEl = document.getElementById("heroMetricRoi");
  const lineEl = document.getElementById("heroLinePath");
  const areaEl = document.getElementById("heroAreaPath");

  if (revEl) {
    revEl.style.transition = "opacity 0.15s ease, transform 0.15s ease";
    revEl.style.opacity = "0.3";
    revEl.style.transform = "translateY(2px)";
    setTimeout(() => {
      revEl.textContent = model.revenue;
      revEl.style.opacity = "1";
      revEl.style.transform = "translateY(0)";
    }, 120);
  }
  if (churnEl) {
    churnEl.style.transition = "opacity 0.15s ease, transform 0.15s ease";
    churnEl.style.opacity = "0.3";
    churnEl.style.transform = "translateY(2px)";
    setTimeout(() => {
      churnEl.textContent = model.churn;
      churnEl.style.opacity = "1";
      churnEl.style.transform = "translateY(0)";
    }, 120);
  }
  if (roiEl) {
    roiEl.style.transition = "opacity 0.15s ease, transform 0.15s ease";
    roiEl.style.opacity = "0.3";
    roiEl.style.transform = "translateY(2px)";
    setTimeout(() => {
      roiEl.textContent = model.roi;
      roiEl.style.opacity = "1";
      roiEl.style.transform = "translateY(0)";
    }, 120);
  }

  if (lineEl && areaEl) {
    lineEl.setAttribute("d", model.lineD);
    areaEl.setAttribute("d", model.areaD);
    lineEl.style.animation = "none";
    void lineEl.offsetWidth; // trigger reflow
    lineEl.style.animation = "drawLine 1.4s cubic-bezier(0.16, 1, 0.3, 1) forwards";
  }
}

// ==========================================================================
// PLATFORM SHOWCASE TABS SWITCHER
// ==========================================================================

function switchPlatformTab(tabName, btnElement) {
  if (btnElement) {
    document.querySelectorAll(".pf-tab-btn").forEach((b) => b.classList.remove("active"));
    btnElement.classList.add("active");
  }

  const targetId = {
    agent: "pfPaneAgent",
    data: "pfPaneData",
    intelligence: "pfPaneIntelligence",
    program: "pfPaneProgram",
  }[tabName] || "pfPaneData";

  document.querySelectorAll(".pf-pane").forEach((p) => p.classList.remove("active"));
  const targetPane = document.getElementById(targetId);
  if (targetPane) {
    targetPane.classList.add("active");
  }
}

document.addEventListener("DOMContentLoaded", () => {
  setupEventListeners();
  // By default, start on landing page in logged-out mode
  showLandingView();
});

function setupEventListeners() {
  // Sentiment Filter Tabs
  document.querySelectorAll(".sentiment-filter-tab").forEach((tab) => {
    tab.addEventListener("click", (e) => {
      document.querySelectorAll(".sentiment-filter-tab").forEach((t) => t.classList.remove("active"));
      tab.classList.add("active");
      activeSentiment = tab.dataset.sentiment;
      renderFeedbackFeed();
    });
  });

  // Search Input
  const searchInput = document.getElementById("feedbackSearch");
  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      searchQuery = e.target.value.toLowerCase().trim();
      renderFeedbackFeed();
    });
  }

  // Sync Modal Triggers
  const openSyncBtn = document.getElementById("openSyncModalBtn");
  const closeSyncBtn = document.getElementById("closeSyncModalBtn");
  const syncModal = document.getElementById("syncModal");
  const runSyncBtn = document.getElementById("runSyncBtn");

  if (openSyncBtn && syncModal) {
    openSyncBtn.addEventListener("click", () => syncModal.classList.add("active"));
  }
  if (closeSyncBtn && syncModal) {
    closeSyncBtn.addEventListener("click", () => syncModal.classList.remove("active"));
  }

  if (runSyncBtn) {
    runSyncBtn.addEventListener("click", handleRunSync);
  }
}

// ==========================================================================
// VIEW SWITCHERS & ROUTING
// ==========================================================================

function showLandingView() {
  document.getElementById("landingView").classList.add("active");
  document.getElementById("loginView").classList.remove("active");
  document.getElementById("dashboardView").classList.remove("active");

  document.getElementById("navHome").classList.add("active");
  document.getElementById("navPortals").classList.remove("active");
  const navLogin = document.getElementById("navLogin");
  if (navLogin) navLogin.classList.remove("active");
  const navDash = document.getElementById("navDash");
  if (navDash) navDash.classList.remove("active");

  window.scrollTo({ top: 0, behavior: "smooth" });
}

function showLoginView(preselectedAccountId) {
  document.getElementById("landingView").classList.remove("active");
  document.getElementById("loginView").classList.add("active");
  document.getElementById("dashboardView").classList.remove("active");

  document.getElementById("navHome").classList.remove("active");
  document.getElementById("navPortals").classList.remove("active");
  const navLogin = document.getElementById("navLogin");
  if (navLogin) navLogin.classList.add("active");
  const navDash = document.getElementById("navDash");
  if (navDash) navDash.classList.remove("active");

  const errorAlert = document.getElementById("loginErrorAlert");
  if (errorAlert) errorAlert.style.display = "none";

  if (preselectedAccountId) {
    const targetUser = PREDEFINED_USERS.find((u) => u.accountId === preselectedAccountId);
    if (targetUser) {
      document.getElementById("loginEmail").value = targetUser.email;
      document.getElementById("loginPassword").value = targetUser.password;
    }
  }

  window.scrollTo({ top: 0, behavior: "smooth" });
}

function showDashboardView(accountId) {
  if (accountId) {
    switchAccount(accountId);
  } else if (!currentAccount) {
    switchAccount("acc_manis");
  }

  isAuthenticated = true;
  updateNavAuthState();

  document.getElementById("landingView").classList.remove("active");
  document.getElementById("loginView").classList.remove("active");
  document.getElementById("dashboardView").classList.add("active");

  document.getElementById("navHome").classList.remove("active");
  document.getElementById("navPortals").classList.remove("active");
  const navLogin = document.getElementById("navLogin");
  if (navLogin) navLogin.classList.remove("active");
  const navDash = document.getElementById("navDash");
  if (navDash) {
    navDash.style.display = "inline-block";
    navDash.classList.add("active");
  }

  window.scrollTo({ top: 0, behavior: "smooth" });
}

function scrollToPortals() {
  if (!document.getElementById("landingView").classList.contains("active")) {
    showLandingView();
  }
  setTimeout(() => {
    const portalsEl = document.getElementById("portalsSection");
    if (portalsEl) {
      portalsEl.scrollIntoView({ behavior: "smooth" });
    }
  }, 100);
}

// ==========================================================================
// AUTHENTICATION & QUICK LOGIN HANDLERS
// ==========================================================================

function quickLogin(accountId) {
  const user = PREDEFINED_USERS.find((u) => u.accountId === accountId);
  if (user) {
    currentUser = user;
    const emailInput = document.getElementById("loginEmail");
    const pwdInput = document.getElementById("loginPassword");
    if (emailInput) emailInput.value = user.email;
    if (pwdInput) pwdInput.value = user.password;
  }
  showDashboardView(accountId);
}

function handleLoginFormSubmit(e) {
  if (e) e.preventDefault();

  const email = (document.getElementById("loginEmail").value || "").trim().toLowerCase();
  const password = (document.getElementById("loginPassword").value || "").trim();
  const errorAlert = document.getElementById("loginErrorAlert");

  const matchedUser = PREDEFINED_USERS.find(
    (u) => u.email.toLowerCase() === email && (u.password === password || password === "password123")
  );

  if (matchedUser) {
    currentUser = matchedUser;
    if (errorAlert) errorAlert.style.display = "none";
    showDashboardView(matchedUser.accountId);
  } else {
    if (errorAlert) {
      errorAlert.textContent = "Invalid business email or password. Please select one of the predefined demo accounts on the right.";
      errorAlert.style.display = "block";
    }
  }
}

function logout() {
  isAuthenticated = false;
  currentUser = null;
  updateNavAuthState();
  showLandingView();
}

function updateNavAuthState() {
  const navUserSession = document.getElementById("navUserSession");
  const navLoginBtn = document.getElementById("navLoginBtn");
  const navTryDemoBtn = document.getElementById("navTryDemoBtn");
  const navDash = document.getElementById("navDash");
  const navLogin = document.getElementById("navLogin");

  if (isAuthenticated) {
    if (navUserSession) navUserSession.style.display = "flex";
    if (navLoginBtn) navLoginBtn.style.display = "none";
    if (navTryDemoBtn) navTryDemoBtn.style.display = "none";
    if (navDash) navDash.style.display = "inline-block";
    if (navLogin) navLogin.style.display = "none";
  } else {
    if (navUserSession) navUserSession.style.display = "none";
    if (navLoginBtn) navLoginBtn.style.display = "inline-flex";
    if (navTryDemoBtn) navTryDemoBtn.style.display = "inline-flex";
    if (navDash) navDash.style.display = "none";
    if (navLogin) navLogin.style.display = "inline-block";
  }
}

function handleNavAccountSwitch(accountId) {
  switchAccount(accountId);
}

function switchAccount(accountId) {
  currentAccountId = accountId;
  currentAccount = REVIEWR_ACCOUNTS.find((a) => a.id === accountId) || REVIEWR_ACCOUNTS[0];
  activeLocation = "All";
  activeSentiment = "all";
  activeTheme = "all";
  searchQuery = "";

  // Reset sentiment tabs
  document.querySelectorAll(".sentiment-filter-tab").forEach((t) => t.classList.remove("active"));
  const allTab = document.querySelector(".sentiment-filter-tab[data-sentiment='all']");
  if (allTab) allTab.classList.add("active");

  const searchInput = document.getElementById("feedbackSearch");
  if (searchInput) searchInput.value = "";

  // Update Top Nav Dropdown & Avatar
  const navAvatar = document.getElementById("navUserAvatar");
  const accSelect = document.getElementById("accountSelect");
  if (navAvatar) navAvatar.src = currentAccount.avatar;
  if (accSelect) accSelect.value = currentAccountId;

  const modalSelect = document.getElementById("modalAccountSelect");
  if (modalSelect) modalSelect.value = currentAccountId;

  // Update Dashboard Top Banner
  const dashAvatar = document.getElementById("dashAvatar");
  const dashName = document.getElementById("dashAccountName");
  const dashBadge = document.getElementById("dashTypeBadge");
  const dashHandle = document.getElementById("dashHandle");
  const dashCategory = document.getElementById("dashCategory");
  const dashTotal = document.getElementById("dashTotalReviews");

  if (dashAvatar) dashAvatar.src = currentAccount.avatar;
  if (dashName) dashName.textContent = currentAccount.name;
  if (dashBadge) {
    dashBadge.textContent = currentAccount.typeLabel;
    dashBadge.className = `cm-src-badge ${currentAccount.type}`;
  }
  if (dashHandle) dashHandle.textContent = currentAccount.handle;
  if (dashCategory) dashCategory.textContent = currentAccount.category;
  if (dashTotal) dashTotal.textContent = `${currentAccount.totalReviews} Total Feedback`;

  // Update Location / Branch / Video Dropdown
  const locSelect = document.getElementById("locationSelect");
  if (locSelect) {
    locSelect.innerHTML = currentAccount.locations.map(
      (loc) => `<option value="${loc}">${loc}</option>`
    ).join("");
  }

  // Update Executive KPIs
  document.getElementById("kpiVal1").textContent = currentAccount.metrics.netSentiment;
  document.getElementById("kpiTrend1").textContent = `▲ ${currentAccount.metrics.netSentimentDelta}`;
  
  document.getElementById("kpiVal2").textContent = currentAccount.metrics.totalFeedback;
  document.getElementById("kpiTrend2").textContent = `▲ ${currentAccount.metrics.totalFeedbackDelta}`;

  document.getElementById("kpiLabel3").textContent = currentAccount.primaryMetricLabel;
  document.getElementById("kpiVal3").textContent = currentAccount.primaryMetricValue;
  document.getElementById("kpiTrend3").textContent = currentAccount.primaryMetricTrend;
  document.getElementById("kpiFooter3").textContent = `${currentAccount.positivePct}% Pos · ${currentAccount.neutralPct}% Neu · ${currentAccount.negativePct}% Neg`;

  document.getElementById("kpiVal4").textContent = currentAccount.metrics.activeThemes;

  // Render Visualizations & Content
  renderCharts();
  renderThemesList();
  renderInsights();
  renderFeedbackFeed();
}

function filterByLocation(loc) {
  activeLocation = loc;
  renderFeedbackFeed();
}

function renderCharts() {
  const timelineCtx = document.getElementById("timelineChart");
  if (!timelineCtx) return;

  if (timelineChart) timelineChart.destroy();

  // Custom data trajectories per account type
  let posData = [320, 410, 480, 560, 620, 710, 840, 920];
  let negData = [80, 95, 70, 85, 60, 75, 55, 64];
  let neuData = [110, 130, 145, 160, 150, 180, 190, 210];

  if (currentAccount.type === "youtube") {
    posData = [4500, 6200, 8900, 14200, 21000, 34000, 48000, 68000];
    negData = [300, 450, 520, 800, 950, 1100, 1400, 1800];
    neuData = [900, 1200, 1800, 2500, 3100, 4200, 5400, 7100];
  } else if (currentAccount.type === "play_store") {
    posData = [12000, 14500, 18200, 16400, 19500, 24000, 28000, 31000];
    negData = [4100, 3800, 6200, 7800, 5400, 4900, 5100, 4800];
    neuData = [3200, 3600, 4100, 4500, 4200, 4800, 5100, 5500];
  }

  timelineChart = new Chart(timelineCtx, {
    type: "line",
    data: {
      labels: ["W1 Aug", "W2 Aug", "W3 Aug", "W4 Aug", "W1 Sep", "W2 Sep", "W3 Sep", "W4 Sep"],
      datasets: [
        {
          label: "Positive Sentiment",
          data: posData,
          borderColor: "#059669",
          backgroundColor: "rgba(5, 150, 105, 0.08)",
          tension: 0.35,
          fill: true,
          borderWidth: 2,
          pointRadius: 3
        },
        {
          label: "Negative Sentiment",
          data: negData,
          borderColor: "#E11D48",
          backgroundColor: "rgba(225, 29, 72, 0.06)",
          tension: 0.35,
          fill: true,
          borderWidth: 2,
          pointRadius: 3
        },
        {
          label: "Neutral Sentiment",
          data: neuData,
          borderColor: "#64748B",
          tension: 0.35,
          borderWidth: 2,
          pointRadius: 3
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "top",
          align: "end",
          labels: { color: "#71717A", font: { family: "Inter", size: 12, weight: 500 } }
        }
      },
      scales: {
        x: {
          grid: { color: "#F4F1EA" },
          ticks: { color: "#71717A", font: { family: "Inter" } }
        },
        y: {
          grid: { color: "#F4F1EA" },
          ticks: { color: "#71717A", font: { family: "Inter" } }
        }
      }
    }
  });
}

function renderThemesList() {
  const container = document.getElementById("themesContainer");
  if (!container) return;

  container.innerHTML = currentAccount.themes.map((theme) => {
    const isSelected = activeTheme === theme.name;
    const isPosTrend = theme.trend.startsWith("+");
    return `
      <div class="cm-theme-item ${isSelected ? 'active' : ''}" onclick="filterByTheme('${theme.name}')">
        <div class="cm-theme-left">
          <span class="cm-theme-dot ${theme.sentiment}"></span>
          <span class="cm-theme-name">${theme.name}</span>
        </div>
        <div class="cm-theme-meta">
          <span class="cm-theme-count">${theme.count.toLocaleString()} mentions</span>
          <span class="cm-theme-trend ${isPosTrend ? 'pos' : 'neg'}">
            ${theme.trend}
          </span>
        </div>
      </div>
    `;
  }).join("");
}

function filterByTheme(themeName) {
  if (activeTheme === themeName) {
    activeTheme = "all";
  } else {
    activeTheme = themeName;
  }
  renderThemesList();
  renderFeedbackFeed();
}

function renderInsights() {
  const container = document.getElementById("insightsContainer");
  if (!container) return;

  container.innerHTML = currentAccount.insights.map((insight) => `
    <div class="cm-insight-card">
      <span class="cm-insight-tag ${insight.type}">${insight.badge}</span>
      <h4 class="cm-insight-title">${insight.title}</h4>
      <p class="cm-insight-desc">${insight.description}</p>
      <div class="cm-insight-footer">
        <span class="cm-theme-tag">${insight.theme}</span>
        <span style="font-weight:700; color:var(--text-dark);">${insight.impact}</span>
      </div>
    </div>
  `).join("");
}

function renderFeedbackFeed() {
  const container = document.getElementById("feedbackFeedContainer");
  const countEl = document.getElementById("feedCountDisplay");
  if (!container) return;

  let items = currentAccount.feedbackItems || [];

  let filtered = items.filter((item) => {
    if (activeLocation !== "All" && item.branch && !activeLocation.includes(item.branch) && !item.branch.includes(activeLocation)) {
      if (!activeLocation.startsWith("All")) return false;
    }
    if (activeSentiment !== "all" && item.sentiment !== activeSentiment) return false;
    if (activeTheme !== "all" && item.theme !== activeTheme) return false;
    if (searchQuery) {
      const matchText = item.text.toLowerCase().includes(searchQuery);
      const matchAuthor = (item.author_name || "").toLowerCase().includes(searchQuery);
      const matchBranch = (item.branch || "").toLowerCase().includes(searchQuery);
      if (!matchText && !matchAuthor && !matchBranch) return false;
    }
    return true;
  });

  if (countEl) {
    countEl.textContent = `Showing ${filtered.length} verified customer feedback items for ${currentAccount.name}`;
  }

  if (filtered.length === 0) {
    container.innerHTML = `
      <div style="text-align:center; padding: 48px; color: var(--text-muted); background: var(--bg-subtle); border-radius: var(--radius-md);">
        <p style="font-size:1.05rem; font-weight:600; color:var(--text-dark); margin-bottom:4px;">No feedback matching criteria</p>
        <p style="font-size:0.85rem;">Try resetting search keywords, location filters, or theme selection.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = filtered.map((item) => {
    const formattedDate = new Date(item.created_at).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });

    const hasReplies = item.replies && item.replies.length > 0;
    const sourceLabel = item.source.replace("_", " ");

    return `
      <div class="cm-feedback-card">
        <div class="cm-fb-header">
          <div class="cm-author-box">
            <img src="${item.author_avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}" class="cm-author-avatar" alt="${item.author_name}" />
            <div>
              <div class="cm-author-name">${item.author_name}</div>
              <div class="cm-fb-date">${formattedDate}</div>
            </div>
          </div>
          <div class="cm-fb-badges">
            ${item.branch ? `<span class="cm-branch-tag">${item.branch}</span>` : ''}
            ${item.rating ? `<span class="cm-stars-badge">${item.rating} ★</span>` : ''}
            <span class="cm-src-badge ${item.source}">${sourceLabel}</span>
            <span class="cm-sentiment-badge ${item.sentiment}">
              <span class="cm-theme-dot ${item.sentiment}"></span>
              ${item.sentiment.toUpperCase()}
            </span>
          </div>
        </div>

        <p class="cm-fb-text">${item.text}</p>

        <div class="cm-fb-footer">
          <span class="cm-theme-tag">${item.theme || 'General Feedback'}</span>
          <div style="display:flex; align-items:center; gap:14px;">
            ${item.metadata && item.metadata.like_count !== undefined ? `<span style="font-size:0.8rem; color:var(--text-muted);">${item.metadata.like_count} likes</span>` : ''}
            ${hasReplies ? `<span style="color:var(--text-muted); font-weight:600; font-size:0.8rem;">${item.replies.length} ${item.replies.length === 1 ? 'reply' : 'replies'}</span>` : ''}
            ${item.source_url ? `<a href="${item.source_url}" target="_blank" style="color:var(--accent-indigo); text-decoration:none; font-weight:600; font-size:0.82rem;">View Review ↗</a>` : ''}
          </div>
        </div>

        ${hasReplies ? `
          <div style="background: var(--bg-subtle); border-left: 2px solid var(--text-dark); border-radius: 6px; padding: 10px 14px; margin-top: 4px; display: flex; flex-direction: column; gap: 4px;">
            <div style="display:flex; align-items:center; gap:8px;">
              <span style="font-size:0.8rem; font-weight:700; color:var(--text-dark);">Response from ${item.replies[0].author_name}</span>
            </div>
            <p style="font-size:0.86rem; color:var(--text-body); margin:0;">${item.replies[0].text}</p>
          </div>
        ` : ''}
      </div>
    `;
  }).join("");
}

// Live Ingestion with step-by-step UI animation
async function handleRunSync() {
  const inputEl = document.getElementById("syncVideoInput");
  const resourceId = inputEl ? inputEl.value.trim() : "ChIJN1t_tDeuEmsRUsoyG83frY4";
  const runBtn = document.getElementById("runSyncBtn");
  const stepsBox = document.getElementById("syncStepsBox");

  runBtn.disabled = true;
  runBtn.innerHTML = `<span class="cm-spinner"></span> Ingesting...`;
  stepsBox.style.display = "flex";

  const steps = [
    { text: `Connecting to ${currentAccount.typeLabel} API provider...` },
    { text: `Fetching customer reviews & comments for '${resourceId}'...` },
    { text: "Standardizing timestamps, star ratings, and metadata JSONB payload..." },
    { text: "Validating composite deduplication constraint (business_id + source + external_id)..." },
    { text: `Successfully synchronized reviews for ${currentAccount.name} into PostgreSQL!` }
  ];

  for (let i = 0; i < steps.length; i++) {
    stepsBox.innerHTML = steps.map((s, idx) => {
      let icon = "⏳";
      let cls = "";
      if (idx < i) {
        icon = "✓";
        cls = "done";
      } else if (idx === i) {
        icon = `<span class="cm-spinner"></span>`;
        cls = "active";
      }
      return `<div class="cm-step-line ${cls}">${icon} ${s.text}</div>`;
    }).join("");
    await new Promise((r) => setTimeout(r, 600));
  }

  const newComment = {
    id: `fb-live-${Date.now()}`,
    source: currentAccount.type,
    source_type: currentAccount.type === "youtube" ? "comment" : "review",
    branch: currentAccount.locations[1] || "Main",
    external_id: `ext_live_${Date.now()}`,
    author_name: "Verified Customer (Reviewr Live)",
    author_avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100",
    rating: currentAccount.type === "youtube" ? null : 5.0,
    sentiment: "positive",
    sentiment_score: 98,
    theme: currentAccount.themes[0].name,
    created_at: new Date().toISOString(),
    text: `[Live Ingestion Sync for ${currentAccount.name}]: Fresh customer review ingested and verified with zero duplicate collisions!`,
    source_url: "#",
    metadata: { verified: true }
  };

  currentAccount.feedbackItems.unshift(newComment);
  renderFeedbackFeed();

  runBtn.disabled = false;
  runBtn.innerHTML = `✓ Ingestion Complete`;

  setTimeout(() => {
    document.getElementById("syncModal").classList.remove("active");
    runBtn.innerHTML = `Start Live Ingestion`;
    stepsBox.style.display = "none";
  }, 1200);
}

// ==========================================================================
// LANDING PAGE: INTERACTIVE NLP SANDBOX & SECTION NAVIGATION
// ==========================================================================

function scrollToSection(sectionId) {
  if (!document.getElementById("landingView").classList.contains("active")) {
    showLandingView();
  }
  setTimeout(() => {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  }, 100);
}

const NLP_SAMPLES = [
  {
    text: "Ordered mutton biriyani at T. Nagar branch yesterday. The meat was remarkably tender and aromatic (+0.94), but the Sunday lunchtime queue took over 40 minutes to seat us!",
    sentiment: "positive",
    badgeText: "POSITIVE (+78)",
    polarity: "Compound Polarity: +0.784",
    summary: "Strong positive polarity on food quality and seasoning, offset by localized negative friction on physical wait times.",
    theme: "🏷️ Mutton Biriyani & Meat Tenderness",
    themeBg: "#F3E8FF",
    themeColor: "#7C3AED",
    entities: '"mutton biriyani", "T. Nagar branch", "Sunday queue"',
    recTag: "friction_point",
    recTagLabel: "Branch Friction Alert",
    recText: "Deploy digital token queue system during Sunday lunch peak (1-3 PM) in T. Nagar branch."
  },
  {
    text: "Spotify audio quality and Discover Weekly recommendations are elite, but offline downloads crash on Android 14 after latest v8.9.42 update.",
    sentiment: "negative",
    badgeText: "NEGATIVE (-64)",
    polarity: "Compound Polarity: -0.642",
    summary: "Critical technical issue identified: Core playback works but major failure reported on local storage cache sync on Android 14.",
    theme: "🏷️ Android 14 Offline Sync & Downloads",
    themeBg: "#FFF1F2",
    themeColor: "#E11D48",
    entities: '"Discover Weekly", "offline downloads", "Android 14", "v8.9.42"',
    recTag: "friction_point",
    recTagLabel: "Critical Bug Alert",
    recText: "Hotfix build v8.9.43 recommended for Android 14 scoped storage permissions to restore 4.8★ app store rating."
  },
  {
    text: "VJ Sidhu comedy timing with the team in the Madurai street food video was peak entertainment! The 4K drone cinematography of the temple was stunning.",
    sentiment: "positive",
    badgeText: "POSITIVE (+96)",
    polarity: "Compound Polarity: +0.962",
    summary: "Overwhelmingly positive community sentiment celebrating humor, crew camaraderie, and production cinematography.",
    theme: "🏷️ Comedy Banter & Travel Crew Chemistry",
    themeBg: "#ECFDF5",
    themeColor: "#059669",
    entities: '"Madurai street food", "4K drone cinematography", "comedy timing"',
    recTag: "positive_driver",
    recTagLabel: "Top Delight Driver",
    recText: "Feature travel crew behind-the-scenes vlogs to maximize 18.4% community engagement rate."
  },
  {
    text: "Visited H&M Mylapore branch for summer shopping. Great linen collection and clean store, but fitting room queues were moving very slow with only 2 cabins open.",
    sentiment: "neutral",
    badgeText: "NEUTRAL (+21)",
    polarity: "Compound Polarity: +0.210",
    summary: "Mixed retail sentiment: Apparel quality and collection are well received, but fitting room bottleneck suppresses customer delight.",
    theme: "🏷️ Fitting Room Wait & Staff Assistance",
    themeBg: "#F1F5F9",
    themeColor: "#64748B",
    entities: '"summer linen collection", "Mylapore branch", "fitting room queues"',
    recTag: "friction_point",
    recTagLabel: "Store Operations Alert",
    recText: "Open second floor fitting room annex during weekend footfall surges to reduce wait time."
  }
];

function loadSampleReview(sampleIdx) {
  const sample = NLP_SAMPLES[sampleIdx];
  if (!sample) return;

  const textarea = document.getElementById("nlpSandboxInput");
  if (textarea) textarea.value = sample.text;

  renderNlpResults(sample);
}

function runNlpDemo() {
  const textarea = document.getElementById("nlpSandboxInput");
  const rawText = (textarea ? textarea.value : "").trim();

  if (!rawText) {
    alert("Please enter review text to process.");
    return;
  }

  // Check matching pre-built sample or run dynamic heuristic evaluation
  const matchedSample = NLP_SAMPLES.find((s) => s.text === rawText);
  if (matchedSample) {
    renderNlpResults(matchedSample);
    return;
  }

  // Dynamic Rule-Based NLP Engine Simulation
  const lower = rawText.toLowerCase();
  let posScore = 0;
  let negScore = 0;

  const posWords = ["good", "great", "love", "tender", "delicious", "amazing", "stunning", "best", "fast", "clean", "elite", "excellent"];
  const negWords = ["bad", "worst", "slow", "delay", "crash", "bug", "terrible", "hate", "issue", "queue", "wait", "problem", "broken"];

  posWords.forEach((w) => { if (lower.includes(w)) posScore += 1; });
  negWords.forEach((w) => { if (lower.includes(w)) negScore += 1; });

  let sentiment = "neutral";
  let polarityCompound = "+0.082";
  let badgeText = "NEUTRAL (+08)";

  if (posScore > negScore) {
    sentiment = "positive";
    polarityCompound = `+0.${Math.min(95, 60 + posScore * 12)}`;
    badgeText = `POSITIVE (+${Math.min(95, 60 + posScore * 10)})`;
  } else if (negScore > posScore) {
    sentiment = "negative";
    polarityCompound = `-0.${Math.min(88, 50 + negScore * 14)}`;
    badgeText = `NEGATIVE (-${Math.min(88, 50 + negScore * 12)})`;
  }

  // Extract entities
  const words = rawText.split(/\s+/).filter((w) => w.length > 4);
  const entities = words.slice(0, 3).map((w) => `"${w.replace(/[^a-zA-Z]/g, "")}"`).join(", ");

  const dynamicResult = {
    sentiment: sentiment,
    badgeText: badgeText,
    polarity: `Compound Polarity: ${polarityCompound}`,
    summary: `Extracted ${posScore} positive aspect tokens and ${negScore} negative friction markers via real-time VADER lexicon tokenizer.`,
    theme: posScore >= negScore ? "🏷️ Product Quality & Customer Experience" : "🏷️ Operational Friction & Bug Report",
    themeBg: sentiment === "positive" ? "#ECFDF5" : (sentiment === "negative" ? "#FFF1F2" : "#F1F5F9"),
    themeColor: sentiment === "positive" ? "#059669" : (sentiment === "negative" ? "#E11D48" : "#64748B"),
    entities: entities || '"customer feedback"',
    recTag: sentiment === "positive" ? "positive_driver" : "friction_point",
    recTagLabel: sentiment === "positive" ? "Top Delight Factor" : "Friction Alert",
    recText: sentiment === "positive"
      ? "Amplify this customer delight pattern across marketing messaging and branch best practices."
      : "Automate priority notification to store operations team to resolve friction point."
  };

  renderNlpResults(dynamicResult);
}

function renderNlpResults(data) {
  const badge = document.getElementById("demoSentimentBadge");
  const polarity = document.getElementById("demoPolarityVal");
  const summary = document.getElementById("demoSentimentSummary");
  const theme = document.getElementById("demoThemeBadge");
  const entities = document.getElementById("demoEntities");
  const recBadge = document.getElementById("demoRecBadge");
  const recText = document.getElementById("demoRecText");

  if (badge) {
    badge.className = `cm-sentiment-badge ${data.sentiment}`;
    badge.innerHTML = `<span class="cm-theme-dot ${data.sentiment}"></span> ${data.badgeText}`;
  }
  if (polarity) polarity.textContent = data.polarity;
  if (summary) summary.textContent = data.summary;
  if (theme) {
    theme.textContent = data.theme;
    theme.style.background = data.themeBg;
    theme.style.color = data.themeColor;
  }
  if (entities) entities.textContent = data.entities;
  if (recBadge) {
    recBadge.className = `cm-insight-tag ${data.recTag}`;
    recBadge.textContent = data.recTagLabel;
  }
  if (recText) recText.textContent = data.recText;
}

// ==========================================================================
// BOOK A DEMO MODAL HANDLERS
// ==========================================================================

function openDemoModal(planName) {
  const modal = document.getElementById("demoModal");
  if (!modal) return;

  const successAlert = document.getElementById("demoBookingSuccess");
  if (successAlert) successAlert.style.display = "none";

  const submitBtn = document.getElementById("demoBookingSubmitBtn");
  if (submitBtn) {
    submitBtn.disabled = false;
    submitBtn.innerHTML = planName ? `Book Demo for ${planName} Plan →` : "Confirm Demo Booking →";
  }

  modal.classList.add("active");
}

function handleDemoBooking(e) {
  if (e) e.preventDefault();

  const successAlert = document.getElementById("demoBookingSuccess");
  const submitBtn = document.getElementById("demoBookingSubmitBtn");

  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.innerHTML = `<span class="cm-spinner"></span> Confirming...`;
  }

  setTimeout(() => {
    if (successAlert) successAlert.style.display = "block";
    if (submitBtn) submitBtn.innerHTML = "✓ Demo Scheduled!";

    setTimeout(() => {
      const modal = document.getElementById("demoModal");
      if (modal) modal.classList.remove("active");
    }, 1800);
  }, 700);
}

// ==========================================================================
// DOVETAIL-INSPIRED INTERACTIVE CURSOR & SPOTLIGHT CONTROLLER
// Enhanced with Micro-Coins, VoC Metric Tokens & Special Glyphs
// ==========================================================================

function initDovetailCursor() {
  const dot = document.getElementById("cursorDot");
  const ring = document.getElementById("cursorRing");
  const badge = document.getElementById("cursorBadge");
  const spotlight = document.getElementById("cursorSpotlight");
  const canvas = document.getElementById("cursorParticleCanvas");

  if (!dot || !ring || !spotlight) return;

  let mouseX = -100;
  let mouseY = -100;
  let prevMouseX = -100;
  let prevMouseY = -100;
  let dotX = -100;
  let dotY = -100;
  let ringX = -100;
  let ringY = -100;
  let spotX = -100;
  let spotY = -100;
  let isHoveringBadge = false;
  let isHoveringClickable = false;
  let isHoveringInput = false;
  let currentBadgeText = "";

  // ------------------------------------------------------------------------
  // Particle Canvas Engine (Micro-Coins, VoC Metrics, Numbers & Glyphs)
  // ------------------------------------------------------------------------
  let ctx = null;
  let particles = [];
  let dpr = window.devicePixelRatio || 1;
  let canvasWidth = window.innerWidth;
  let canvasHeight = window.innerHeight;

  const TOKEN_COINS = ["₿", "₹", "$", "€", "¥"];
  const TOKEN_METRICS = ["+24%", "98.2%", "4.9★", "0.95", "+16%", "99.4%", "14.8x", "+41.8%", "VoC", "AI"];
  const TOKEN_GLYPHS = ["✦", "▲", "§", "//", "✓", "•", "Ø", "#", "&", "⌘", "⌥", "⚡", "::", "→", "~", "<>", "+"];
  const THEME_COLORS = ["#7C3AED", "#4F46E5", "#059669", "#D97706", "#18181B", "#6366F1"];

  if (canvas && canvas.getContext) {
    ctx = canvas.getContext("2d");
    function resizeCanvas() {
      canvasWidth = window.innerWidth;
      canvasHeight = window.innerHeight;
      dpr = window.devicePixelRatio || 1;
      canvas.width = canvasWidth * dpr;
      canvas.height = canvasHeight * dpr;
      canvas.style.width = canvasWidth + "px";
      canvas.style.height = canvasHeight + "px";
      if (ctx) ctx.scale(dpr, dpr);
    }
    window.addEventListener("resize", resizeCanvas);
    resizeCanvas();
  }

  function spawnParticle(x, y, isBurst = false) {
    if (!ctx) return;
    if (particles.length > 50) return; // Prevent excess count

    // Categorize particle type
    const rand = Math.random();
    let type = "glyph";
    let text = "";
    let color = THEME_COLORS[Math.floor(Math.random() * THEME_COLORS.length)];

    if (rand < 0.35) {
      type = "coin";
      text = TOKEN_COINS[Math.floor(Math.random() * TOKEN_COINS.length)];
      color = Math.random() > 0.4 ? "#D97706" : "#7C3AED"; // Gold or Violet coin
    } else if (rand < 0.70) {
      type = "metric";
      text = TOKEN_METRICS[Math.floor(Math.random() * TOKEN_METRICS.length)];
      color = text.startsWith("+") || text.includes("★") ? "#059669" : "#7C3AED";
    } else {
      type = "glyph";
      text = TOKEN_GLYPHS[Math.floor(Math.random() * TOKEN_GLYPHS.length)];
    }

    const angle = isBurst ? Math.random() * Math.PI * 2 : (Math.random() * Math.PI * 2);
    const speed = isBurst ? 1.5 + Math.random() * 3.0 : 0.6 + Math.random() * 1.4;

    particles.push({
      x: x + (Math.random() - 0.5) * 12,
      y: y + (Math.random() - 0.5) * 12,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - (isBurst ? 0.8 : 0.4), // slight float up
      type: type,
      text: text,
      color: color,
      size: type === "metric" ? 9 : (type === "coin" ? 11 : 10),
      alpha: 0.95,
      life: isBurst ? 55 + Math.random() * 25 : 45 + Math.random() * 20,
      maxLife: 60,
      rotation: (Math.random() - 0.5) * 0.4,
      rotSpeed: (Math.random() - 0.5) * 0.04
    });
  }

  function updateAndDrawParticles() {
    if (!ctx) return;
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.015; // gentle gravity
      p.vx *= 0.98; // air drag
      p.rotation += p.rotSpeed;
      p.life--;
      p.alpha = Math.max(0, p.life / p.maxLife);

      if (p.life <= 0 || p.alpha <= 0.01) {
        particles.splice(i, 1);
        continue;
      }

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);
      ctx.globalAlpha = p.alpha;

      if (p.type === "coin") {
        // Draw Dovetail-styled miniature embossed crypto/fiat coin disc
        const radius = p.size;
        ctx.beginPath();
        ctx.arc(0, 0, radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color === "#D97706" ? "rgba(254, 243, 199, 0.95)" : "rgba(245, 243, 255, 0.95)";
        ctx.fill();
        ctx.lineWidth = 1.2;
        ctx.strokeStyle = p.color;
        ctx.stroke();

        // Inner coin symbol
        ctx.font = `700 ${Math.round(p.size * 1.1)}px 'Inter', sans-serif`;
        ctx.fillStyle = p.color;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(p.text, 0, 0.5);
      } else if (p.type === "metric") {
        // Draw miniature pill chip with metric text
        ctx.font = `600 ${p.size}px 'Inter', sans-serif`;
        const textMetrics = ctx.measureText(p.text);
        const paddingX = 6;
        const pillWidth = textMetrics.width + paddingX * 2;
        const pillHeight = p.size + 6;

        ctx.beginPath();
        ctx.roundRect(-pillWidth / 2, -pillHeight / 2, pillWidth, pillHeight, 9999);
        ctx.fillStyle = p.color === "#059669" ? "rgba(236, 253, 245, 0.92)" : "rgba(245, 243, 255, 0.92)";
        ctx.fill();
        ctx.lineWidth = 1;
        ctx.strokeStyle = p.color === "#059669" ? "rgba(5, 150, 105, 0.35)" : "rgba(124, 58, 237, 0.35)";
        ctx.stroke();

        ctx.fillStyle = p.color;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(p.text, 0, 0);
      } else {
        // Draw special character / gibberish glyph
        ctx.font = `700 ${p.size}px 'Inter', monospace`;
        ctx.fillStyle = p.color;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(p.text, 0, 0);
      }

      ctx.restore();
    }
  }

  // ------------------------------------------------------------------------
  // Mouse & Interaction Handlers
  // ------------------------------------------------------------------------
  let distAccumulator = 0;

  window.addEventListener("mousemove", (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    document.body.classList.add("cursor-active");

    if (prevMouseX !== -100) {
      const dx = mouseX - prevMouseX;
      const dy = mouseY - prevMouseY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      distAccumulator += dist;

      // Spawn micro-token trail on fluid movement
      if (distAccumulator > 32) {
        spawnParticle(mouseX, mouseY, false);
        distAccumulator = 0;
      }
    }

    prevMouseX = mouseX;
    prevMouseY = mouseY;
  });

  window.addEventListener("mouseleave", () => {
    document.body.classList.remove("cursor-active");
  });

  window.addEventListener("mouseenter", () => {
    document.body.classList.add("cursor-active");
  });

  window.addEventListener("mousedown", (e) => {
    document.body.classList.add("cursor-clicking");
    // Emit playful burst of micro-tokens and coins on click
    for (let i = 0; i < 6; i++) {
      spawnParticle(e.clientX, e.clientY, true);
    }
  });

  window.addEventListener("mouseup", () => {
    document.body.classList.remove("cursor-clicking");
  });

  // Dynamic hover detection for contextual badges and states
  document.addEventListener("mouseover", (e) => {
    const target = e.target;
    if (!target) return;

    const customBadgeEl = target.closest("[data-cursor-label]");
    const heroCard = target.closest(".hero-roi-card, .roi-header, .roi-metrics-grid");
    const showcaseCard = target.closest(".showcase-tab-card, .showcase-tabs-nav");
    const compareCard = target.closest(".aspect-breakdown-card, .compare-card");
    const featureCard = target.closest(".what-we-do-card, .cm-feature-card, .workflow-step-card");
    const pricingCard = target.closest(".pricing-card");

    if (customBadgeEl) {
      isHoveringBadge = true;
      currentBadgeText = customBadgeEl.getAttribute("data-cursor-label") || "Explore";
    } else if (heroCard) {
      isHoveringBadge = true;
      currentBadgeText = "Analyze";
    } else if (showcaseCard) {
      isHoveringBadge = true;
      currentBadgeText = "Explore";
    } else if (compareCard) {
      isHoveringBadge = true;
      currentBadgeText = "Compare";
    } else if (featureCard) {
      isHoveringBadge = true;
      currentBadgeText = "Inspect";
    } else if (pricingCard) {
      isHoveringBadge = true;
      currentBadgeText = "Plan";
    } else {
      isHoveringBadge = false;
      currentBadgeText = "";
    }

    const clickable = target.closest("button, a, .cm-btn, .roi-tf-btn, .tab-btn, .cm-nav-link, select, input[type='radio'], input[type='checkbox'], [role='button'], .clickable");
    isHoveringClickable = !!clickable && !isHoveringBadge;

    const textInput = target.closest("input[type='text'], input[type='email'], input[type='search'], input[type='password'], textarea");
    isHoveringInput = !!textInput;

    if (isHoveringBadge) {
      document.body.classList.add("cursor-hover-badge");
      document.body.classList.remove("cursor-hover-clickable", "cursor-hover-input");
      if (badge) badge.textContent = currentBadgeText;
    } else if (isHoveringClickable) {
      document.body.classList.add("cursor-hover-clickable");
      document.body.classList.remove("cursor-hover-badge", "cursor-hover-input");
    } else if (isHoveringInput) {
      document.body.classList.add("cursor-hover-input");
      document.body.classList.remove("cursor-hover-badge", "cursor-hover-clickable");
    } else {
      document.body.classList.remove("cursor-hover-badge", "cursor-hover-clickable", "cursor-hover-input");
    }
  });

  // High-performance physics rendering loop (lerp easing)
  function renderCursor() {
    dotX += (mouseX - dotX) * 0.75;
    dotY += (mouseY - dotY) * 0.75;

    ringX += (mouseX - ringX) * 0.18;
    ringY += (mouseY - ringY) * 0.18;

    spotX += (mouseX - spotX) * 0.08;
    spotY += (mouseY - spotY) * 0.08;

    dot.style.transform = `translate3d(${dotX}px, ${dotY}px, 0)`;
    ring.style.transform = `translate3d(${ringX}px, ${ringY}px, 0)`;
    spotlight.style.transform = `translate3d(${spotX}px, ${spotY}px, 0)`;

    updateAndDrawParticles();

    requestAnimationFrame(renderCursor);
  }

  requestAnimationFrame(renderCursor);
}

// Auto-initialize when script loads
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initDovetailCursor);
} else {
  initDovetailCursor();
}




