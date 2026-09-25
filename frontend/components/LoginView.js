"use client";

import { useState } from "react";
import { PREDEFINED_USERS } from "../lib/mockData";

export default function LoginView({
  isActive,
  onLoginSuccess,
  onNavigateLanding,
}) {
  const [email, setEmail] = useState("admin@manisbiriyani.com");
  const [password, setPassword] = useState("password123");
  const [rememberWorkspace, setRememberWorkspace] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const handleQuickLogin = (accountId) => {
    const user = PREDEFINED_USERS.find((u) => u.accountId === accountId);
    if (user) {
      setEmail(user.email);
      setPassword(user.password);
    }
    setErrorMessage("");
    onLoginSuccess(accountId);
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    const cleanEmail = (email || "").trim().toLowerCase();
    const cleanPassword = (password || "").trim();

    const matchedUser = PREDEFINED_USERS.find(
      (u) =>
        u.email.toLowerCase() === cleanEmail &&
        (u.password === cleanPassword || cleanPassword === "password123")
    );

    if (matchedUser) {
      setErrorMessage("");
      onLoginSuccess(matchedUser.accountId);
    } else {
      setErrorMessage(
        "Invalid business email or password. Please select one of the predefined demo accounts on the right."
      );
    }
  };

  return (
    <section id="loginView" className={`view-section ${isActive ? "active" : ""}`}>
      <div className="login-page-wrapper">
        {/* Left Column: Traditional Login Form */}
        <div className="login-left-card">
          <div>
            <div className="cm-pill-badge" style={{ marginBottom: "12px" }}>
              <span className="dot"></span>
              <span>Workspace Authentication</span>
            </div>
            <h2 className="login-form-title">Sign in to Reviewr</h2>
            <p className="login-form-sub">
              Enter your business credentials to access your personalized customer feedback intelligence workspace.
            </p>
          </div>

          {errorMessage && (
            <div
              id="loginErrorAlert"
              style={{
                display: "block",
                background: "var(--sentiment-neg-bg)",
                border: "1px solid var(--sentiment-neg-border)",
                color: "var(--sentiment-neg)",
                padding: "10px 14px",
                borderRadius: "var(--radius-sm)",
                fontSize: "0.85rem",
                fontWeight: 600,
              }}
            >
              {errorMessage}
            </div>
          )}

          <form className="login-form" id="loginForm" onSubmit={handleFormSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="loginEmail">
                Business Work Email
              </label>
              <input
                type="email"
                id="loginEmail"
                className="form-input"
                placeholder="e.g. admin@manisbiriyani.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="form-group">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <label className="form-label" htmlFor="loginPassword">
                  Password
                </label>
                <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Default: password123</span>
              </div>
              <input
                type="password"
                id="loginPassword"
                className="form-input"
                placeholder="••••••••"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                fontSize: "0.82rem",
                color: "var(--text-muted)",
              }}
            >
              <label style={{ display: "flex", alignItems: "center", gap: "6px", cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={rememberWorkspace}
                  onChange={(e) => setRememberWorkspace(e.target.checked)}
                  style={{ accentColor: "var(--text-dark)" }}
                />{" "}
                Remember this workspace
              </label>
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  alert("For demo accounts, use password123");
                }}
                style={{ color: "var(--text-dark)", textDecoration: "none", fontWeight: 600 }}
              >
                Forgot password?
              </a>
            </div>

            <button type="submit" className="login-submit-btn">
              Sign In to Business Dashboard →
            </button>
          </form>

          <div
            style={{
              paddingTop: "16px",
              borderTop: "1px solid var(--border-subtle)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              fontSize: "0.84rem",
            }}
          >
            <span style={{ color: "var(--text-muted)" }}>Need to review the landing page?</span>
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                onNavigateLanding();
              }}
              style={{ color: "var(--text-dark)", fontWeight: 700, textDecoration: "none" }}
            >
              ← Return to Overview
            </a>
          </div>
        </div>

        {/* Right Column: Predefined Demo Credentials Card */}
        <div className="predefined-credentials-card">
          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <h3 className="predefined-creds-title">Predefined Demo Accounts</h3>
              <span className="cm-src-badge google_maps" style={{ background: "#F3E8FF", color: "#7C3AED" }}>
                1-Click Instant Login
              </span>
            </div>
            <p style={{ fontSize: "0.86rem", color: "var(--text-muted)", marginTop: "4px" }}>
              Select any business persona below to auto-fill credentials and enter its customized intelligence dashboard:
            </p>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {/* 1. Mani's Dum Biriyani */}
            <div className="demo-account-btn" onClick={() => handleQuickLogin("acc_manis")}>
              <div className="demo-acc-left">
                <img
                  src="/assets/logos/manis_dum_biriyani.png"
                  className="demo-acc-avatar"
                  alt="Mani's Dum Biriyani"
                />
                <div>
                  <span className="demo-acc-name">Mani's Dum Biriyani</span>
                  <span className="demo-acc-email">admin@manisbiriyani.com · 4 Branches</span>
                </div>
              </div>
              <span className="demo-acc-arrow">Login →</span>
            </div>

            {/* 2. Chepauk Sports Store */}
            <div className="demo-account-btn" onClick={() => handleQuickLogin("acc_chepauk")}>
              <div className="demo-acc-left">
                <img
                  src="/assets/logos/chepauk_sports.png"
                  className="demo-acc-avatar"
                  alt="Chepauk Sports Store"
                />
                <div>
                  <span className="demo-acc-name">Chepauk Sports Store</span>
                  <span className="demo-acc-email">murali@chepauksports.com · Retail Store</span>
                </div>
              </div>
              <span className="demo-acc-arrow">Login →</span>
            </div>

            {/* 3. H&M Mylapore Branch */}
            <div className="demo-account-btn" onClick={() => handleQuickLogin("acc_hm")}>
              <div className="demo-acc-left">
                <img
                  src="/assets/logos/hm_mylapore.png"
                  className="demo-acc-avatar"
                  alt="H&M Mylapore"
                />
                <div>
                  <span className="demo-acc-name">H&M Mylapore Branch</span>
                  <span className="demo-acc-email">store.mylapore@hm.com · Fashion Showroom</span>
                </div>
              </div>
              <span className="demo-acc-arrow">Login →</span>
            </div>

            {/* 4. VJ Sidhu Vlogs */}
            <div className="demo-account-btn" onClick={() => handleQuickLogin("acc_vj_sidhu")}>
              <div className="demo-acc-left">
                <img
                  src="/assets/logos/vj_sidhu_vlogs.png"
                  className="demo-acc-avatar"
                  alt="VJ Sidhu Vlogs"
                />
                <div>
                  <span className="demo-acc-name">VJ Sidhu Vlogs</span>
                  <span className="demo-acc-email">sidhu@vjsidhuvlogs.com · YouTube Channel</span>
                </div>
              </div>
              <span className="demo-acc-arrow">Login →</span>
            </div>

            {/* 5. Spotify */}
            <div className="demo-account-btn" onClick={() => handleQuickLogin("acc_spotify")}>
              <div className="demo-acc-left">
                <img
                  src="/assets/logos/spotify.png"
                  className="demo-acc-avatar"
                  alt="Spotify"
                />
                <div>
                  <span className="demo-acc-name">Spotify Android</span>
                  <span className="demo-acc-email">product.android@spotify.com · Play Store App</span>
                </div>
              </div>
              <span className="demo-acc-arrow">Login →</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
