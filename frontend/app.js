/**
 * Feedback Intelligence - Chattermill Design System Logic & Interactivity
 */

let currentFeedbacks = [...MOCK_FEEDBACK_ITEMS];
let activeSource = "all";
let activeSentiment = "all";
let activeTheme = "all";
let searchQuery = "";

// Chart instances
let timelineChart = null;

document.addEventListener("DOMContentLoaded", () => {
  initDashboard();
  setupEventListeners();
  renderCharts();
  renderThemesList();
  renderFeedbackFeed();
  renderInsights();
});

function initDashboard() {
  const select = document.getElementById("businessSelect");
  if (select) {
    select.innerHTML = MOCK_BUSINESSES.map(
      (b) => `<option value="${b.id}">${b.name} (${b.category})</option>`
    ).join("");
  }
}

function setupEventListeners() {
  // Source Filter Tabs
  document.querySelectorAll(".source-filter-tab").forEach((tab) => {
    tab.addEventListener("click", (e) => {
      document.querySelectorAll(".source-filter-tab").forEach((t) => t.classList.remove("active"));
      tab.classList.add("active");
      activeSource = tab.dataset.source;
      renderFeedbackFeed();
    });
  });

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

function renderCharts() {
  const timelineCtx = document.getElementById("timelineChart");
  if (timelineCtx) {
    if (timelineChart) timelineChart.destroy();
    timelineChart = new Chart(timelineCtx, {
      type: "line",
      data: {
        labels: ["W1 Aug", "W2 Aug", "W3 Aug", "W4 Aug", "W1 Sep", "W2 Sep", "W3 Sep", "W4 Sep"],
        datasets: [
          {
            label: "Positive Feedback",
            data: [320, 410, 480, 560, 620, 710, 840, 920],
            borderColor: "#059669",
            backgroundColor: "rgba(5, 150, 105, 0.08)",
            tension: 0.35,
            fill: true,
            borderWidth: 2,
            pointRadius: 3
          },
          {
            label: "Negative Feedback",
            data: [80, 95, 70, 85, 60, 75, 55, 64],
            borderColor: "#E11D48",
            backgroundColor: "rgba(225, 29, 72, 0.06)",
            tension: 0.35,
            fill: true,
            borderWidth: 2,
            pointRadius: 3
          },
          {
            label: "Neutral Feedback",
            data: [110, 130, 145, 160, 150, 180, 190, 210],
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
}

function renderThemesList() {
  const container = document.getElementById("themesContainer");
  if (!container) return;

  container.innerHTML = MOCK_THEMES.map((theme) => {
    const isSelected = activeTheme === theme.name;
    const isPosTrend = theme.trend.startsWith("+");
    return `
      <div class="cm-theme-item ${isSelected ? 'active' : ''}" onclick="filterByTheme('${theme.name}')">
        <div class="cm-theme-left">
          <span class="cm-theme-dot ${theme.sentiment}"></span>
          <span class="cm-theme-name">${theme.name}</span>
        </div>
        <div class="cm-theme-meta">
          <span class="cm-theme-count">${theme.count} items</span>
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

  container.innerHTML = MOCK_AI_INSIGHTS.map((insight) => `
    <div class="cm-insight-card">
      <span class="cm-insight-tag ${insight.type}">${insight.badge}</span>
      <h4 class="cm-insight-title">${insight.title}</h4>
      <p class="cm-insight-desc">${insight.description}</p>
      <div class="cm-fb-footer">
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

  let filtered = currentFeedbacks.filter((item) => {
    if (activeSource !== "all" && item.source !== activeSource) return false;
    if (activeSentiment !== "all" && item.sentiment !== activeSentiment) return false;
    if (activeTheme !== "all" && item.theme !== activeTheme) return false;
    if (searchQuery) {
      const matchText = item.text.toLowerCase().includes(searchQuery);
      const matchAuthor = (item.author_name || "").toLowerCase().includes(searchQuery);
      if (!matchText && !matchAuthor) return false;
    }
    return true;
  });

  if (countEl) {
    countEl.textContent = `Showing ${filtered.length} feedback items`;
  }

  if (filtered.length === 0) {
    container.innerHTML = `
      <div style="text-align:center; padding: 48px; color: var(--text-muted); background: var(--bg-subtle); border-radius: var(--radius-md);">
        <p style="font-size:1.05rem; font-weight:600; color:var(--text-dark); margin-bottom:4px;">No customer feedback matching criteria</p>
        <p style="font-size:0.85rem;">Try adjusting search keywords, source tabs, or theme filters.</p>
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
            <span class="cm-src-badge ${item.source}">${sourceLabel}</span>
            <span class="cm-sentiment-badge ${item.sentiment}">
              <span class="cm-theme-dot ${item.sentiment}"></span>
              ${item.sentiment.toUpperCase()}
            </span>
          </div>
        </div>

        <p class="cm-fb-text">${item.text}</p>

        <div class="cm-fb-footer">
          <span class="cm-theme-tag">${item.theme || 'General'}</span>
          <div style="display:flex; align-items:center; gap:14px;">
            ${item.metadata && item.metadata.like_count !== undefined ? `<span>👍 ${item.metadata.like_count}</span>` : ''}
            ${hasReplies ? `<span style="color:var(--text-muted); font-weight:600;">💬 ${item.replies.length} replies</span>` : ''}
            ${item.source_url ? `<a href="${item.source_url}" target="_blank" style="color:var(--accent-indigo); text-decoration:none; font-weight:600;">View ↗</a>` : ''}
          </div>
        </div>

        ${hasReplies ? `
          <div style="background: var(--bg-subtle); border-left: 2px solid var(--text-dark); border-radius: 6px; padding: 10px 14px; margin-top: 4px; display: flex; flex-direction: column; gap: 4px;">
            <div style="display:flex; align-items:center; gap:8px;">
              <img src="${item.replies[0].author_avatar}" style="width:20px; height:20px; border-radius:50%;" />
              <span style="font-size:0.8rem; font-weight:700; color:var(--text-dark);">${item.replies[0].author_name}</span>
            </div>
            <p style="font-size:0.86rem; color:var(--text-body); margin:0;">${item.replies[0].text}</p>
          </div>
        ` : ''}
      </div>
    `;
  }).join("");
}

// Live Simulated YouTube Ingestion with step-by-step UI animation
async function handleRunSync() {
  const videoInput = document.getElementById("syncVideoInput");
  const videoId = videoInput ? videoInput.value.trim() : "jNQXAC9IVRw";
  const runBtn = document.getElementById("runSyncBtn");
  const stepsBox = document.getElementById("syncStepsBox");

  if (!videoId) {
    alert("Please enter a YouTube video ID or URL");
    return;
  }

  runBtn.disabled = true;
  runBtn.innerHTML = `<span class="cm-spinner"></span> Ingesting...`;
  stepsBox.style.display = "flex";

  const steps = [
    { text: "Connecting to YouTube Data API v3 (HTTPX client)..." },
    { text: `Fetching commentThreads for video ID '${videoId}'...` },
    { text: "Extracting top-level comments & nested reply threads..." },
    { text: "Normalizing payload into generic Feedback schema..." },
    { text: "Verifying composite constraint (business_id, source, external_id)..." },
    { text: "Successfully persisted comments to PostgreSQL database!" }
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

  // Prepend newly ingested comment to the live feed
  const newComment = {
    id: `fb-live-${Date.now()}`,
    business_id: "b1",
    source: "youtube",
    source_type: "comment",
    external_id: `Ugx_live_${Date.now()}`,
    parent_external_id: null,
    author_name: "Antigravity Live Tester",
    author_avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80",
    text: `[Live Ingested from YouTube Video ${videoId}]: The YouTube comments synchronization pipeline works cleanly with zero duplicate records!`,
    rating: null,
    rating_scale: null,
    sentiment: "positive",
    sentiment_score: 98,
    theme: "API & Developer Experience",
    created_at: new Date().toISOString(),
    source_url: `https://www.youtube.com/watch?v=${videoId}`,
    metadata: {
      video_id: videoId,
      like_count: 5,
      is_reply: false
    }
  };

  currentFeedbacks.unshift(newComment);
  renderFeedbackFeed();

  runBtn.disabled = false;
  runBtn.innerHTML = `✓ Ingestion Complete`;

  setTimeout(() => {
    document.getElementById("syncModal").classList.remove("active");
    runBtn.innerHTML = `Start Live Ingestion`;
    stepsBox.style.display = "none";
  }, 1200);
}
