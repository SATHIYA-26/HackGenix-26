"use client";

import { useState } from "react";
import { ArrowRight, ArrowLeft, Shield, Lock, Mail, CheckCircle2 } from "lucide-react";

export const PREDEFINED_USERS = [
  {
    email: "admin@manisbiriyani.com",
    password: "password123",
    accountId: "acc_manis",
    name: "Mani",
    businessName: "Mani's Dum Biriyani",
    role: "Founder & Operations",
    badge: "4 Branches",
    type: "google_maps",
    typeLabel: "Google Maps Restaurant Chain",
    logo: "/assets/logos/manis_dum_biriyani.png",
  },
  {
    email: "murali@chepauksports.com",
    password: "password123",
    accountId: "acc_chepauk",
    name: "Murali Ranganathan",
    businessName: "Chepauk Sports Store",
    role: "Managing Director",
    badge: "Retail Store",
    type: "google_maps",
    typeLabel: "Google Maps Retail Showroom",
    logo: "/assets/logos/chepauk_sports.png",
  },
  {
    email: "product.android@spotify.com",
    password: "password123",
    accountId: "acc_spotify",
    name: "Gustav Söderström",
    businessName: "Spotify Android",
    role: "Head of Mobile & CX",
    badge: "Play Store App",
    type: "play_store",
    typeLabel: "Google Play Store App",
    logo: "/assets/logos/spotify.png",
  },
  {
    email: "arun@mrwhosetheboss.com",
    password: "password123",
    accountId: "acc_mrwhosetheboss",
    name: "Arun Maini",
    businessName: "Mrwhosetheboss",
    role: "YouTube Creator Studio",
    badge: "YouTube Channel",
    type: "youtube",
    typeLabel: "YouTube Channel (Creator Studio)",
    logo: "/assets/logos/mrwhosetheboss.png",
  },
];

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
        "Invalid business email or password. Please select one of the 4 verified accounts on the right."
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
              Enter your credentials to access your live FastAPI-powered feedback intelligence platform.
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
              <span style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>
                Password: password123
              </span>
            </div>

            <button type="submit" className="login-submit-btn flex items-center justify-center gap-2">
              <span>Sign In to Business Dashboard</span>
              <ArrowRight className="w-4 h-4" />
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
              className="flex items-center gap-1.5"
              style={{ color: "var(--text-dark)", fontWeight: 700, textDecoration: "none" }}
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Return to Overview</span>
            </a>
          </div>
        </div>

        {/* Right Column: 4 Predefined Demo Accounts */}
        <div className="predefined-credentials-card">
          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <h3 className="predefined-creds-title">Predefined Business Workspaces</h3>
              <span className="cm-src-badge google_maps" style={{ background: "#F3E8FF", color: "#7C3AED" }}>
                1-Click Instant Login
              </span>
            </div>
            <p style={{ fontSize: "0.86rem", color: "var(--text-muted)", marginTop: "4px" }}>
              Select any of the 4 business personas below to auto-load its live backend dataset and customized intelligence dashboard:
            </p>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {PREDEFINED_USERS.map((user) => (
              <div
                key={user.accountId}
                className="demo-account-btn"
                onClick={() => handleQuickLogin(user.accountId)}
              >
                <div className="demo-acc-left">
                  <img
                    src={user.logo}
                    className="demo-acc-avatar"
                    alt={user.businessName}
                  />
                  <div>
                    <span className="demo-acc-name">{user.businessName}</span>
                    <span className="demo-acc-email">
                      {user.email} · {user.badge}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1 demo-acc-arrow">
                  <span>Enter</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
