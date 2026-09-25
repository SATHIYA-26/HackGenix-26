# Feedback Intelligence Platform

> **Turn millions of scattered customer voices into traceable product decisions.**

An AI-powered product feedback intelligence platform that continuously collects customer feedback from multiple sources, discovers recurring and emerging product problems, prioritizes them using evidence, and generates actionable, traceable product insights.

---

## 🚀 Problem

Companies receive customer feedback across many disconnected channels:

* App Store reviews
* Google Play reviews
* Google Business Profile reviews
* YouTube comments
* Support tickets
* Surveys
* Community platforms
* Social media
* Custom feedback systems

The problem is not the lack of feedback.

The problem is **making sense of it at scale**.

Thousands of inconsistent comments can hide the same underlying product problem, while teams may end up prioritizing issues based on isolated complaints rather than aggregate evidence.

---

## 💡 Solution

Our platform continuously ingests feedback from connected sources and transforms unstructured customer voices into structured, evidence-backed product intelligence.

```text
Feedback Sources
       ↓
Automatic Ingestion
       ↓
Normalization & Deduplication
       ↓
NLP Analysis
       ↓
Semantic Embeddings
       ↓
Problem Discovery
       ↓
Trend Detection
       ↓
Priority Engine
       ↓
LLM Insight Generation
       ↓
Traceable Product Decisions
```

---

## ✨ Key Features

### 🔌 Multi-Source Feedback Connectors

Connect feedback sources without manually uploading files.

* YouTube
* Google Business Profile
* Google Play
* Apple App Store
* Support platforms
* Surveys
* Community platforms
* Custom APIs

---

### 🔄 Continuous Feedback Ingestion

Automatically retrieve new feedback at scheduled intervals.

* Incremental fetching
* Deduplication
* Background processing
* Source synchronization
* Retry handling

---

### 🧠 NLP-Based Feedback Understanding

Each feedback item is analyzed for:

* Sentiment
* Intent
* Product area
* Topic
* Semantic meaning
* Metadata

---

### 🔍 Automatic Problem Discovery

The system groups semantically similar feedback to discover recurring product problems without requiring every problem to be manually predefined.

Example:

```text
"Payment succeeded but order disappeared"

"Money was deducted but order failed"

"UPI payment completed but order wasn't created"

                ↓

       PAYMENT / ORDER FAILURE
```

---

### 📈 Emerging Problem Detection

Track how problems change over time.

The system detects:

* Increasing complaint volume
* Sudden spikes
* Sentiment deterioration
* Version-specific problems
* Platform-specific problems
* Location-specific problems

---

### 🎯 Evidence-Based Prioritization

Problems are prioritized using measurable signals:

```text
Frequency
Severity
Growth
User Impact
Negative Sentiment
```

The priority engine is explainable rather than relying on an opaque prediction.

---

### 🤖 LLM-Powered Product Insights

The LLM receives aggregated evidence from the analytics pipeline and converts it into concise product intelligence.

Example:

```text
Problem:
Payment confirmation failures

Evidence:
2,341 related feedback items
+240% growth
89% negative sentiment
Mostly Android v4.2 users

Insight:
The increase is strongly concentrated around
the Android 4.2 release and appears related to
the payment-confirmation → order-creation flow.

Recommended investigation:
Review transaction callback and order creation
handling introduced in the affected release.
```

---

### 🔎 Traceable Evidence

Every insight can be traced back to its underlying evidence.

```text
Product Insight
      ↓
Problem Cluster
      ↓
Aggregate Metrics
      ↓
Representative Feedback
      ↓
Original Source
```

This prevents the AI from becoming a black box.

---

### 💬 AI-Assisted Response Generation

Generate suggested responses for customer feedback.

```text
Customer Feedback
       ↓
Context + Problem
       ↓
LLM
       ↓
Suggested Response
       ↓
Human Review
       ↓
Publish
```

---

## 🏗️ Architecture

```text
                       ┌───────────────────────┐
                       │    Feedback Sources   │
                       │                       │
                       │ YouTube               │
                       │ Google Business       │
                       │ Google Play           │
                       │ App Store             │
                       │ Support / Surveys     │
                       └───────────┬───────────┘
                                   │
                                   ▼
                       ┌───────────────────────┐
                       │   Connector Layer     │
                       │ OAuth / APIs / Webhook │
                       └───────────┬───────────┘
                                   │
                                   ▼
                       ┌───────────────────────┐
                       │ FastAPI Ingestion     │
                       └───────────┬───────────┘
                                   │
                                   ▼
                       ┌───────────────────────┐
                       │ Redis + Celery        │
                       │ Async Processing      │
                       └───────────┬───────────┘
                                   │
                                   ▼
                       ┌───────────────────────┐
                       │ PostgreSQL            │
                       │ Raw + Metadata        │
                       └───────────┬───────────┘
                                   │
                                   ▼
                       ┌───────────────────────┐
                       │ NLP Processing        │
                       │ Sentiment / Intent    │
                       └───────────┬───────────┘
                                   │
                                   ▼
                       ┌───────────────────────┐
                       │ BGE Embeddings        │
                       └───────────┬───────────┘
                                   │
                                   ▼
                       ┌───────────────────────┐
                       │ PostgreSQL + pgvector │
                       └───────────┬───────────┘
                                   │
                                   ▼
                       ┌───────────────────────┐
                       │ BERTopic + HDBSCAN    │
                       │ Problem Discovery     │
                       └───────────┬───────────┘
                                   │
                                   ▼
                       ┌───────────────────────┐
                       │ Trend + Priority      │
                       │ Engine                │
                       └───────────┬───────────┘
                                   │
                                   ▼
                       ┌───────────────────────┐
                       │ GPT-class LLM         │
                       │ Insight Generation    │
                       └───────────┬───────────┘
                                   │
                                   ▼
                       ┌───────────────────────┐
                       │ Next.js Dashboard     │
                       └───────────────────────┘
```

---

## 🧰 Technology Stack

### Frontend

* Next.js
* TypeScript
* Tailwind CSS
* shadcn/ui
* ECharts / Recharts

### Backend

* Python
* FastAPI
* Celery
* Redis

### Database

* PostgreSQL
* pgvector

### NLP / ML

* spaCy
* RoBERTa
* DistilBERT
* BGE
* BERTopic
* HDBSCAN

### AI

* GPT-class LLM

### Infrastructure

* Docker
* AWS

---

## 🔄 Processing Pipeline

```text
Source
  ↓
Fetch New Feedback
  ↓
Normalize
  ↓
Deduplicate
  ↓
Store
  ↓
Sentiment + Intent
  ↓
Generate Embedding
  ↓
Semantic Search
  ↓
Topic / Problem Clustering
  ↓
Trend Analysis
  ↓
Priority Calculation
  ↓
Important Problem Detection
  ↓
LLM Insight Generation
  ↓
Dashboard
```

---

## 🎯 Example

### Raw Feedback

```text
"After the latest update my UPI payment succeeds,
but the order gets cancelled."
```

### NLP

```text
Sentiment: Negative
Intent: Payment / Transaction Failure
Platform: Android
Version: 4.2
```

### Semantic Cluster

```text
Payment Confirmation / Order Creation Failure
```

### Aggregate Evidence

```text
Feedback: 2,341
Growth: +240%
Negative: 89%
Main Platform: Android
Main Version: 4.2
```

### Product Insight

```text
A rapidly increasing payment-confirmation problem
is concentrated among Android 4.2 users.

The product team should investigate the payment
callback and order creation flow.
```

---

## 📂 Project Structure

```text
feedback-intelligence/
│
├── frontend/
│   ├── app/
│   ├── components/
│   ├── dashboard/
│   └── lib/
│
├── backend/
│   ├── app/
│   │   ├── api/
│   │   ├── connectors/
│   │   ├── ingestion/
│   │   ├── nlp/
│   │   ├── embeddings/
│   │   ├── clustering/
│   │   ├── priority/
│   │   ├── insights/
│   │   └── models/
│   │
│   ├── workers/
│   └── main.py
│
├── ml/
│   ├── sentiment/
│   ├── intent/
│   ├── embeddings/
│   └── clustering/
│
├── infrastructure/
│   ├── docker/
│   └── aws/
│
├── tests/
│
├── docker-compose.yml
├── .env.example
├── requirements.txt
└── README.md
```

---

## 🔐 Data & Security

* OAuth/API-key based source authentication
* Secrets stored through environment variables / secret manager
* No unnecessary storage of personal information
* Source-level access controls
* Tenant isolation
* Audit logs for generated insights and responses

---

## 📊 Scalability

The platform is designed around asynchronous processing.

```text
Feedback Sources
       ↓
Queue
       ↓
Workers
       ↓
NLP Processing
       ↓
Database
       ↓
Analytics
```

Workers can be horizontally scaled as feedback volume increases.

The LLM is used primarily for **aggregated/high-value insights**, rather than making an expensive LLM request for every incoming message.

---

## 🧠 Future Learning-Based Prioritization

The initial priority engine uses explainable statistical scoring because a new deployment does not have historical product-team decisions.

As organizations accumulate historical decisions:

```text
Historical Feedback
        +
Historical Product Decisions
        ↓
Feature Engineering
        ↓
XGBoost
        ↓
Learned Priority Prediction
```

This allows the platform to eventually learn organization-specific prioritization patterns.

---

## 🚀 Getting Started

### 1. Clone

```bash
git clone <repository-url>
cd feedback-intelligence
```

### 2. Configure environment

```bash
cp .env.example .env
```

Configure:

```env
DATABASE_URL=
REDIS_URL=
LLM_API_KEY=
YOUTUBE_API_KEY=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
APPLE_KEY_ID=
APPLE_ISSUER_ID=
```

### 3. Start infrastructure

```bash
docker compose up -d
```

### 4. Start backend

```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### 5. Start frontend

```bash
cd frontend
npm install
npm run dev
```

---

## 🛣️ Roadmap

* [x] Multi-source feedback architecture
* [x] NLP processing
* [x] Semantic embeddings
* [x] Problem clustering
* [x] Priority engine
* [x] LLM insights
* [ ] YouTube connector
* [ ] Google Business Profile connector
* [ ] Google Play connector
* [ ] App Store connector
* [ ] Support platform connectors
* [ ] Real-time event processing
* [ ] Automated response workflows
* [ ] Organization-specific learned prioritization
* [ ] XGBoost priority model with historical decision data

---

## 👥 Use Cases

### SaaS Companies

Identify recurring feature complaints and emerging product issues.

### Mobile Apps

Analyze App Store and Google Play reviews across versions.

### Retail & Restaurants

Aggregate location-based customer reviews and detect recurring service problems.

### Media & Content

Analyze YouTube/community feedback to understand audience pain points.

### Support Teams

Convert thousands of support conversations into product-level insights.

### Product Teams

Move from individual complaints to evidence-backed product decisions.

---

## 📌 Core Value Proposition

> **Don't just collect customer feedback. Turn it into evidence-backed product decisions.**

---

## 📜 License

MIT License
