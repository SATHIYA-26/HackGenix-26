# Reviewr — Technology Stack & Architecture Reference

**Reviewr** is an AI-native customer feedback analysis and Voice of Customer (VoC) SaaS platform inspired by **Chattermill.com**, built to unify fragmented reviews and comments from **Google Maps**, **YouTube**, **Google Play Store**, and **Instagram** into a normalized PostgreSQL intelligence engine.

---

## 1. System Architecture Overview

```
                                  REVIEWR ARCHITECTURE
                                  
    ┌─────────────────────────────── DATA SOURCES ───────────────────────────────┐
    │                                                                             │
    │   📍 Google Maps          ▶ YouTube Data API v3     📱 Google Play Store    │
    │   (Branch-wise Reviews)   (Comments & Replies)      (App Build Versions)    │
    └──────────────────────────────────────┬──────────────────────────────────────┘
                                           │
                                    [HTTPX Client]
                                           │
                                           ▼
    ┌──────────────────────────── INGESTION PIPELINE ─────────────────────────────┐
    │                                                                             │
    │   1. Schema Normalization   ───► Unified `Feedback` Model (Author, JSONB)   │
    │   2. Idempotency Check      ───► Composite Constraint (UUID + Source + ID)  │
    │   3. AI Theme Engine        ───► Topic Clustering (Positive / Neu / Neg)    │
    └──────────────────────────────────────┬──────────────────────────────────────┘
                                           │
                                           ▼
    ┌────────────────────────────── DATABASE LAYER ───────────────────────────────┐
    │                                                                             │
    │   PostgreSQL 16 (SQLAlchemy 2.x ORM + Alembic Migrations + JSONB Indexes)   │
    │   • businesses          • youtube_channels                                  │
    │   • feedback            • youtube_videos                                    │
    └──────────────────────────────────────┬──────────────────────────────────────┘
                                           │
                                           ▼
    ┌────────────────────────────── FRONTEND LAYER ───────────────────────────────┐
    │                                                                             │
    │   Chattermill-Inspired Design System (Fraunces + Plus Jakarta Sans + Inter) │
    │   • Executive KPI Grid    • Sentiment Trend Visualizer (Chart.js)           │
    │   • AI Theme Discovery    • Recommendation Engine & Real-time Live Sync     │
    └─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Frontend Technologies (Prototype & Web App)

| Category | Technology | Description & Role |
|---|---|---|
| **Core Languages** | **HTML5** & **Modern JavaScript (ES6+)** | Semantic structure, reactive state management, asynchronous fetch pipelines, and interactive DOM rendering without heavy framework overhead. |
| **Styling & Design System** | **Vanilla CSS3 (Custom Design System)** | Complete recreation of the **Chattermill.com** aesthetic: custom HSL color tokens, glassmorphism, rounded pill geometry (`border-radius: 9999px`), and fluid layouts. |
| **Typography** | **Plus Jakarta Sans** | Geometric Grotesque typeface used for the **Reviewr** brand wordmark, logo mark, and UI elements. |
| | **Fraunces** | Editorial display serif with styled italic accents used for headings and key metrics. |
| | **Inter** | Clean, high-legibility sans-serif for numerical data, badges, and feedback body text. |
| **Data Visualization** | **Chart.js v4.4.2** | Interactive canvas-based line charts rendering sentiment trajectory curves (Positive, Neutral, Negative) and volume trends. |
| **Color Palette Tokens** | **Warm Sand (`#FBF9F5`)** | Primary page background evoking Chattermill's signature light ivory theme. |
| | **Crisp White (`#FFFFFF`)** | Elevated cards with subtle sand borders (`#E5E2DC`). |
| | **Deep Obsidian (`#18181B`)** | High-contrast dark buttons, typography, and logo badge. |
| | **Emerald Green (`#059669`)** | Positive customer sentiment indicator (`#ECFDF5` background). |
| | **Cool Slate (`#64748B`)** | Neutral customer sentiment indicator (`#F1F5F9` background). |
| | **Crimson (`#E11D48`)** | Negative customer sentiment indicator (`#FFF1F2` background). |
| **Prototyping Server** | **Python `http.server` / `serve.py`** | Lightweight development web server serving the frontend on `http://localhost:3000`. |

---

## 3. Backend & API Services (`dev-rishi` Branch)

| Technology | Version | Purpose & Description |
|---|---|---|
| **Python** | `3.11+ / 3.12+` | Primary programming language chosen for its rich data analytics and backend ecosystem. |
| **FastAPI** | `>=0.110.0` | High-performance asynchronous REST API framework utilized for route controllers, dependency injection, and automatic OpenAPI / Swagger documentation. |
| **Uvicorn** | `>=0.28.0` | Lightning-fast ASGI web server with `WatchFiles` reload support for local development. |
| **Pydantic** | `>=2.6.4` | Data validation and schema enforcement utilizing Pydantic V2 core for request/response serialization. |
| **Pydantic-Settings** | `>=2.2.1` | Environment variable parsing and `.env` configuration management. |
| **HTTPX** | `>=0.27.0` | Next-generation asynchronous HTTP client used to communicate with the **Google YouTube Data API v3** without third-party SDK bloat or HTML scraping. |
| **PostgreSQL** | `16-alpine` | Production relational database engine storing multi-tenant business records, channel metadata, and normalized customer feedback. |
| **SQLAlchemy** | `2.0+` | Modern ORM using 2.0 Declarative Mappings, typed `Mapped[T]`, and database-agnostic UUIDs. |
| **Psycopg 3 / Psycopg2** | `>=3.1.18` | High-performance PostgreSQL database adapters for binary protocol communications. |
| **Alembic** | `>=1.13.1` | Database migration engine managing incremental schema changes, indexes, and unique constraints. |

---

## 4. Integration & Data Standardization Pipeline

### Official Google YouTube Data API v3 Integration
* **API Endpoints Utilized**:
  - `commentThreads.list`: Ingests top-level comments and snippet-embedded replies (`part=snippet,replies`, `maxResults=100`, `textFormat=plainText`).
  - `comments.list`: Dispatched when `totalReplyCount > embeddedReplies` to retrieve complete nested reply threads.
  - `videos.list`: Fetches video title, channel ID, channel name, and original published timestamp.
* **Error & Quota Mapping**:
  - `commentsDisabled` (403) $\rightarrow$ Handled gracefully without crash.
  - `quotaExceeded` (429) $\rightarrow$ Returns structured quota status.
  - `keyInvalid` (401/400) $\rightarrow$ Flags invalid API credentials.
  - `videoNotFound` (404) $\rightarrow$ Validates resource existence.

### Unified Generic Feedback Model
All customer feedback items (Google Maps reviews, YouTube comments, Play Store reviews, Instagram comments) standardize into the following generic schema:

```sql
CREATE TABLE feedback (
    id UUID PRIMARY KEY,
    business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
    source VARCHAR(50) NOT NULL,            -- 'youtube', 'google_maps', 'play_store', 'instagram'
    source_type VARCHAR(50) NOT NULL,       -- 'comment', 'review'
    external_id VARCHAR(255) NOT NULL,      -- Unique third-party platform ID
    parent_external_id VARCHAR(255),        -- Parent comment ID if reply
    author_name VARCHAR(255),
    author_url VARCHAR(500),
    text TEXT NOT NULL,
    rating FLOAT,                           -- e.g. 5.0 (NULL for YouTube)
    rating_scale FLOAT,                     -- e.g. 5.0 (NULL for YouTube)
    created_at TIMESTAMP WITH TIME ZONE,    -- Platform publication timestamp
    updated_at TIMESTAMP WITH TIME ZONE,
    source_url VARCHAR(500),
    metadata JSONB,                         -- Likes, video_id, branch, device, app_version
    ingested_at TIMESTAMP WITH TIME ZONE NOT NULL,
    CONSTRAINT uq_feedback_business_source_external UNIQUE (business_id, source, external_id)
);
```

---

## 5. Testing & Quality Assurance Suite

| Tool | Version | Purpose |
|---|---|---|
| **pytest** | `>=8.1.1` | Test runner executing unit, integration, and parser test suites. |
| **pytest-asyncio** | `>=0.23.6` | Async coroutine testing support for FastAPI routes and HTTPX clients. |
| **pytest-mock** | `>=3.14.0` | Controlled mock fixtures for YouTube API responses, network timeouts, and quota edge cases. |
| **SQLite (In-Memory)** | In-Memory `StaticPool` | Isolated zero-dependency test database allowing sub-second test execution. |

---

## 6. Containerization & Infrastructure

| Component | Tool / Config | Description |
|---|---|---|
| **Container Engine** | **Docker** & **Docker Compose** | Manages containerized PostgreSQL 16 database with volume persistence and health checks. |
| **Environment Config** | **`.env` / `.env.example`** | Server-side environment isolation ensuring API keys (`YOUTUBE_API_KEY`) and database credentials remain secret. |
| **Branching Strategy** | **`dev-rishi`** | Clean backend Module 1 implementation (FastAPI, Alembic, PostgreSQL, YouTube API client, tests). |
| | **`prototype`** | Standalone Chattermill-styled frontend application with 5 predefined business accounts and AI recommendations. |
