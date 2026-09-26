"use client";

export default function Navbar({
  activeView,
  isAuthenticated,
  currentAccountId,
  currentAccount,
  onNavigate,
  onAccountChange,
  onOpenSyncModal,
  onOpenDemoModal,
  onLogout,
  onScrollToSection
}) {
  return (
    <header className="cm-nav">
      <div className="cm-nav-container">
        <a
          href="#"
          className="cm-logo-wrap"
          onClick={(e) => {
            e.preventDefault();
            onNavigate("landing");
          }}
        >
          <span className="cm-logo-text">Reviewr</span>
        </a>

        <nav className="cm-nav-links">
          <span
            className={`cm-nav-link ${activeView === "landing" ? "active" : ""}`}
            id="navHome"
            onClick={() => onNavigate("landing")}
          >
            Overview
          </span>
          <span
            className="cm-nav-link"
            id="navWhatWeDo"
            onClick={() => onScrollToSection("whatWeDoSection")}
          >
            What we do?
          </span>
          <span
            className="cm-nav-link"
            id="navPricing"
            onClick={() => onScrollToSection("pricingSection")}
          >
            Pricing
          </span>
          <span
            className={`cm-nav-link ${activeView === "login" ? "active" : ""}`}
            id="navPortals"
            onClick={() => onNavigate("login")}
          >
            Demo
          </span>
          {isAuthenticated && (
            <span
              className={`cm-nav-link ${activeView === "dashboard" ? "active" : ""}`}
              id="navDash"
              onClick={() => onNavigate("dashboard")}
              style={{ display: "inline-block" }}
            >
              Dashboard
            </span>
          )}
        </nav>

        <div className="cm-nav-actions">
          {/* Logged Out CTA */}
          {!isAuthenticated ? (
            <>
              <button
                id="navLoginBtn"
                className="cm-btn cm-btn-outline"
                onClick={() => onNavigate("login")}
              >
                Log In
              </button>
              <button
                id="navTryDemoBtn"
                className="cm-btn cm-btn-primary"
                onClick={() => onOpenDemoModal()}
              >
                Book a Demo
              </button>
            </>
          ) : (
            /* Logged In User State (Visible in Dashboard) */
            <div
              id="navUserSession"
              className="cm-user-session-bar"
              style={{ display: "flex", alignItems: "center", gap: "12px" }}
            >
              <div className="cm-account-switcher-bar">
                <img
                  id="navUserAvatar"
                  src={
                    currentAccount?.avatar ||
                    "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=100"
                  }
                  className="cm-acc-avatar"
                  alt="Avatar"
                />
                <select
                  id="accountSelect"
                  className="cm-acc-select"
                  value={currentAccountId}
                  onChange={(e) => onAccountChange(e.target.value)}
                >
                  <option value="acc_manis">Mani's Dum Biriyani (Google Maps)</option>
                  <option value="acc_chepauk">Chepauk Sports Store (Google Maps)</option>
                  <option value="acc_spotify">Spotify (Google Play Store)</option>
                  <option value="acc_mrwhosetheboss">Mrwhosetheboss (YouTube Channel)</option>
                </select>
              </div>

              <button
                id="openSyncModalBtn"
                className="cm-btn cm-btn-primary"
                onClick={onOpenSyncModal}
              >
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                  <path d="M3 3v5h5" />
                  <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
                  <path d="M16 21h5v-5" />
                </svg>
                Live Sync
              </button>

              <button
                id="navLogoutBtn"
                className="cm-btn cm-btn-outline"
                onClick={onLogout}
                title="Log out of current workspace"
              >
                Log Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
