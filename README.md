# Reviewr — AI Voice of Customer & Feedback Intelligence Platform

> **Interactive Frontend Prototype Branch (`prototype`)**
> 
> Reviewr is an AI-powered Voice of Customer (VoC) SaaS platform that turns chaotic, unstructured multi-channel customer reviews into actionable product roadmap insights, sentiment analytics, and quantifiable revenue growth.

---

## 🌟 Prototype Features

This branch contains the standalone, high-fidelity interactive prototype for **Reviewr**:

- **Modern Hero Experience**:
  - Pinned responsive navigation bar with clean branding and unified login modal.
  - Interactive announcement pill (`✦ Meet Reviewr AI`) highlighting the automated feedback analysis agent.
  - Dynamic **Financial Impact & Sentiment Graph Widget** with live interactive timeframes (`30D`, `90D`, `Annual YoY`) showcasing real-time ARR and retention calculations.
- **Unified Feedback Intelligence Hub**:
  - Interactive multi-tab platform preview: **Agent**, **Data**, **Intelligence**, and **Program**.
  - Real-time sentiment metrics, churn risk indicators, and theme-level actionable recommendations.
- **Side-by-Side Aspect Breakdown**:
  - Live comparison card demonstrating how Reviewr transforms fragmented review text into structured root-cause insights vs. traditional keyword clouds.
- **Curated Multi-Channel Ingestion**:
  - Live mock data streams showcasing cross-platform synchronization (YouTube comments, Google Maps, Google Play Store, Instagram, App Store, and Trustpilot).
- **Interactive Modals & Workflows**:
  - Quick-start integration flows, enterprise demo scheduling modals, and contextual drill-down dialogs.

---

## 🚀 Quick Start (Running Locally)

The prototype is lightweight, zero-dependency, and can be served with Python's built-in HTTP server:

### 1. Launch the Server

```bash
# From the repository root
python frontend/serve.py
```

### 2. Open in Browser

Navigate to:
```
http://localhost:3000
```

---

## 📂 Project Structure (`prototype` branch)

```
.
├── frontend/
│   ├── index.html         # Main application markup & interactive views
│   ├── styles.css         # Modern design system (dark mode, glassmorphism, responsive)
│   ├── app.js             # Client interactivity, dynamic charts, modals, and tab logic
│   ├── mockData.js        # Realistic VoC datasets, sentiment trends, and benchmark metrics
│   ├── serve.py           # Simple local development web server
│   ├── assets/            # Vector brand icons and logos
│   └── site.webmanifest   # Web app manifest and metadata
├── README.md              # Project documentation
└── TECH_STACK.md          # Architecture and design specifications
```

---

## 🎨 Design Philosophy & Aesthetics

- **Curated Color Palette**: Dark-mode primary background (`#0b0f19`) paired with glowing cyan/emerald telemetry accents and refined border highlights.
- **Glassmorphism & Depth**: Multi-layered cards with subtle backdrop blur, responsive hover micro-interactions, and fluid SVG charts.
- **Production-Ready UX**: Fast load times, zero external heavy framework overhead, and accessible semantic HTML.

---

## 🌿 Branch Overview

- **`prototype`** (Current): Dedicated purely to the interactive frontend client prototype and visual demonstrations.
- **`dev-rishi`**: Backend services, multi-channel API integrations, PostgreSQL schemas, and automated test suites.
