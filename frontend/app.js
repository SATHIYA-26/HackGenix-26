/**
 * Reviewr - Frontend Application Logic
 * Supports Chattermill Landing Page & Customized Business Dashboards
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
            ${item.branch ? `<span class="cm-branch-tag">📍 ${item.branch}</span>` : ''}
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
            ${item.metadata && item.metadata.like_count !== undefined ? `<span>👍 ${item.metadata.like_count}</span>` : ''}
            ${hasReplies ? `<span style="color:var(--text-muted); font-weight:600;">💬 ${item.replies.length} reply</span>` : ''}
            ${item.source_url ? `<a href="${item.source_url}" target="_blank" style="color:var(--accent-indigo); text-decoration:none; font-weight:600;">View Review ↗</a>` : ''}
          </div>
        </div>

        ${hasReplies ? `
          <div style="background: var(--bg-subtle); border-left: 2px solid var(--text-dark); border-radius: 6px; padding: 10px 14px; margin-top: 4px; display: flex; flex-direction: column; gap: 4px;">
            <div style="display:flex; align-items:center; gap:8px;">
              <span style="font-size:0.8rem; font-weight:700; color:var(--text-dark);">💬 ${item.replies[0].author_name}</span>
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
