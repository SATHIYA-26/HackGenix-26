# Feedback Intelligence Platform

A high-performance SaaS backend that transforms unstructured customer feedback from any channel (YouTube, Google Play, App Store, Support Tickets, Surveys, Custom APIs) into actionable, traceable product intelligence.

---

## High-Level Architecture Flow

```text
Raw Feedback (Canonical Input)
    ↓
Text Normalization & Noise Filtering
    ↓
RoBERTa Sentiment + DistilBERT Intent
    ↓
BAAI/bge-base-en-v1.5 Semantic Embeddings (pgvector)
    ↓
HDBSCAN & BERTopic Problem Discovery
    ↓
Dynamic Trend & Emerging Issue Detection
    ↓
Explainable Multi-Factor Priority Engine
    ↓
Evidence-Backed Recommendations
    ↓
LLM-Synthesized Executive Problem Insights
    ↓
Traceable Product Decision (Audit Trail to Source URLs)
```

---

## Implementation Roadmap (Minimal 4-Phase Plan)

1. **Phase 1: Project Foundation, Database Architecture, Canonical Ingestion API & 500+ Mock Dataset** *(Completed)*
   - Core FastAPI application with lifespan management, structured logging, and domain exception handlers.
   - SQLAlchemy 2.x models with cross-dialect vector support (PostgreSQL + pgvector / SQLite test compatibility).
   - Canonical source-agnostic feedback schemas and Pydantic v2 validation.
   - Alembic migration environment and initial schema migration (`0001_initial`).
   - Repository layer (`Feedback`, `Problem`, `Trend`, `Recommendation`, `Insight`).
   - Mock feedback generator with **530 realistic records** spanning 4 weeks with surge dynamics for trend testing.
   - Ingestion endpoints (`POST /feedback`, `POST /feedback/batch`, `GET /feedback`, `GET /feedback/{id}`, `/health`, `/ready`).
   - Dockerfile and multi-service `docker-compose.yml` (backend, postgres, redis, celery worker).
   - Unit and API test suite (13 tests passing, 79% coverage).

2. **Phase 2: Complete NLP Pipeline** *(Next)*
   - Preprocessing: noise filtering, tokenization, language validation, emoji preservation, near-duplicate detection.
   - RoBERTa sentiment analysis service (singleton model loading, batch inference).
   - DistilBERT intent classification service (10 categories: payment_issue, bug, login_issue, etc.).
   - BGE embeddings generator (`BAAI/bge-base-en-v1.5`) with pgvector semantic similarity search.
   - HDBSCAN + BERTopic problem discovery and topic clustering.

3. **Phase 3: Intelligence & Analytics Engine**
   - Product/Feature metadata extraction (platform, product, version, feature).
   - Dynamic trend detection (window comparisons, growth rate calculation, emerging issue flags).
   - Explainable priority engine (weighted frequency, severity, growth, user impact, negative sentiment).
   - Evidence-backed recommendation engine (Observed, Inferred, Recommended separation).
   - LLM executive insight engine (OpenAI-compatible client with deterministic fallback).

4. **Phase 4: Celery Background Workers, Full REST APIs, Seed Demo & Production Verification**
   - Celery worker tasks with Redis message broker and idempotent processing.
   - Complete REST API routes (`/analysis`, `/problems`, `/trends`, `/recommendations`, `/dashboard`).
   - One-command end-to-end seed demo (`python -m app.seed`).
   - End-to-end test suite, Docker deployment test, and complete validation report.

---

## Quickstart (Local Development)

### 1. Requirements
- Python 3.11+
- PostgreSQL with pgvector (or SQLite for development/testing)
- Redis

### 2. Environment Setup
```bash
cp backend/.env.example backend/.env
pip install -r backend/requirements.txt
```

### 3. Running Tests
```bash
python -m pytest backend/tests -v --cov=backend/app
```

### 4. Running the Dev Server
```bash
uvicorn backend.app.main:app --host 0.0.0.0 --port 8000 --reload
```

Interactive API documentation available at:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`
