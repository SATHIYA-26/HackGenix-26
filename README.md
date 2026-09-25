# Reviewr — AI Voice of Customer & Feedback Intelligence Platform

> **Turn scattered customer voices into evidence-backed product decisions.**

An AI-powered feedback intelligence platform that continuously collects customer feedback from multiple sources, understands unstructured conversations, discovers recurring and emerging problems, measures their impact, prioritizes product issues, and generates traceable insights for product teams.
# Feedback Intelligence Platform

> **Turn scattered customer voices into evidence-backed product decisions.**

An AI-powered feedback intelligence platform that continuously collects customer feedback from multiple sources, understands unstructured conversations, discovers recurring and emerging problems, measures their impact, prioritizes product issues, and generates traceable insights for product teams.

---

## Overview

Modern companies receive customer feedback across multiple channels:

* App Store and Google Play reviews
* Google Business Profile reviews
* YouTube comments
* Support tickets and chats
* Surveys and feedback forms
* Community platforms
* Social platforms
* Internal feedback systems
* Custom APIs

The challenge is not collecting feedback.

The challenge is **understanding thousands of inconsistent messages and converting them into reliable product decisions**.

A customer might say:

> "Payment went through but my order disappeared."

Another might say:

> "Money got deducted and then the order was cancelled."

Another might say:

> "UPI worked but I never got my food."

These may represent the **same underlying product problem**.

The platform automatically identifies these relationships and transforms them into a structured, prioritized, and traceable product insight.

---

# Problem

Companies commonly face four problems:

### 1. Feedback is fragmented

Customer opinions are distributed across different platforms and systems.

### 2. Feedback is unstructured

The same problem can be described in hundreds of different ways.

### 3. Teams struggle to prioritize

A small number of loud complaints can receive more attention than a widespread but less visible issue.

### 4. Product decisions lack traceability

Teams may know *what* they want to fix without being able to easily trace the decision back to the underlying customer evidence.

---

# Solution

The platform creates a continuous pipeline:

```text
Customer Feedback
       ↓
Automatic Collection
       ↓
Normalization
       ↓
NLP Understanding
       ↓
Semantic Embeddings
       ↓
Problem Discovery
       ↓
Trend Detection
       ↓
Priority Analysis
       ↓
LLM Insight Generation
       ↓
Evidence & Traceability
       ↓
Product Decision
```

Instead of asking an LLM to read every individual message, the system combines **NLP, semantic search, clustering, analytics, and LLM reasoning**.

This makes the architecture more scalable and keeps product insights grounded in measurable evidence.

---

# Key Features

## 🔌 Multi-Source Feedback Collection

Connect multiple feedback sources and continuously retrieve new feedback.

Potential integrations include:

* YouTube
* Google Business Profile
* Google Play
* Apple App Store
* Customer-support platforms
* Survey platforms
* Community platforms
* Social platforms
* Custom REST APIs
* Webhooks

The connector architecture allows additional sources to be added without changing the core intelligence pipeline.

---

## 🔄 Continuous Feedback Ingestion

Instead of manually uploading feedback files, connected sources can be synchronized periodically.

The ingestion system handles:

* Incremental fetching
* Duplicate detection
* Source normalization
* Metadata extraction
* Background processing
* Retry handling
* Failed-job recovery

```text
Connected Source
       ↓
Scheduler
       ↓
Fetch New Feedback
       ↓
Deduplication
       ↓
Processing Queue
       ↓
AI Pipeline
```

---

# 🧹 Feedback Normalization

Different platforms expose different data structures.

The system converts them into a common internal representation.

```text
Source
Text
Rating
Timestamp
Author
Platform
Product
Version
Location
Metadata
```

This allows the AI pipeline to process feedback consistently regardless of its source.

---

# 🧠 NLP-Based Feedback Understanding

Each feedback item is analyzed to extract structured information.

### Sentiment

Identifies whether feedback is:

* Positive
* Neutral
* Negative

### Intent

Identifies the primary purpose or issue type:

* Payment
* Login
* Delivery
* Performance
* Refund
* Account
* Feature request
* Bug
* Support issue

### Metadata

Where available, the system can associate feedback with:

* Product version
* Platform
* Location
* Customer segment
* Feature
* Source

---

# 🔎 Semantic Understanding

Keyword matching alone cannot recognize that:

> "Money was deducted but my order vanished"

and

> "UPI payment completed but order wasn't created"

are related.

The system generates semantic embeddings for feedback and stores them using vector search.

```text
Feedback
   ↓
Embedding Model
   ↓
Vector Representation
   ↓
Vector Database
   ↓
Semantic Similarity
```

This enables the system to find feedback with similar meanings even when completely different words are used.

---

# 🧩 Automatic Problem Discovery

The platform automatically groups semantically related feedback.

For example:

```text
"App crashes after update"

"Latest version keeps closing"

"Can't open the app after updating"

"App freezes on startup"
```

can form a common problem cluster:

```text
POST-UPDATE APPLICATION CRASH
```

This allows the system to discover product problems without requiring every issue to be manually predefined.

---

# 📈 Emerging Problem Detection

The system continuously analyzes how feedback changes over time.

It can identify:

* Sudden increases in complaints
* Increasing negative sentiment
* New problem clusters
* Version-specific problems
* Platform-specific problems
* Location-specific problems
* Recurring issues
* Declining or improving problems

Example:

```text
Week 1      42 complaints
Week 2      61 complaints
Week 3      117 complaints
Week 4      286 complaints

              ↑
        Emerging Problem
```

---

# 🎯 Evidence-Based Prioritization

Problems are evaluated using measurable signals such as:

* Feedback volume
* Severity
* Growth rate
* Negative sentiment
* Number of affected users
* Product/platform impact
* Recurrence

The initial system uses an explainable scoring model rather than requiring historical training labels.

Example:

```text
Frequency       0.91
Severity        0.88
Growth          0.94
User Impact     0.82
Sentiment       0.90
────────────────────
Priority        HIGH
```

The individual factors remain visible so product teams can understand **why** an issue received its priority.

---

# 🤖 LLM-Powered Product Intelligence

The LLM is used after the analytics pipeline has identified important problems.

It receives structured evidence rather than hundreds of thousands of raw messages.

Example input:

```text
Problem:
Payment confirmation failure

Feedback:
2,341 related messages

Growth:
+240%

Negative sentiment:
89%

Affected platform:
Android

Affected version:
4.2
```

The LLM converts this evidence into a concise product insight.

Example:

```text
Payment confirmation failures have increased
significantly among Android 4.2 users.

The issue appears concentrated around the
payment-confirmation to order-creation flow.

The product team should investigate transaction
callback and order creation handling.
```

The LLM is therefore used primarily for **reasoning, synthesis, explanation, and communication**, while quantitative prioritization remains grounded in structured data.

---

# 🔎 Traceable Insights

Every generated insight can be traced back to its underlying evidence.

```text
Product Insight
      ↓
Problem Cluster
      ↓
Aggregate Metrics
      ↓
Representative Feedback
      ↓
Original Feedback
      ↓
Original Source
```

A product manager can therefore ask:

> **"Why did the system identify this as an important problem?"**

and inspect the evidence behind the conclusion.

---

# 💬 AI-Assisted Customer Responses

The platform can also generate response drafts.

```text
Customer Feedback
       ↓
Problem Context
       ↓
Customer Sentiment
       ↓
LLM
       ↓
Suggested Response
       ↓
Human Review
       ↓
Publish
```

Responses can be adapted to different contexts:

* Support response
* Review response
* Customer-service message
* Product announcement
* Internal escalation

Human approval can remain in the workflow before publishing.

---

# 📊 Product Intelligence Dashboard

The dashboard provides a centralized view of customer feedback.

### Overview

```text
Total Feedback
Active Problems
Emerging Problems
High-Priority Problems
Resolved Problems
```

### Problem Trends

```text
Payment        ███████████████
Performance    ███████████
Delivery       █████████
Refund         ███████
Login          █████
```

### Problem Details

```text
Payment Confirmation Failure

2,341 Feedback
+240% Growth
89% Negative

Affected:
Android 4.2

Priority:
HIGH

[View Evidence]
[View Feedback]
[View AI Insight]
```

---

# 🏗️ System Architecture

```text
                         ┌───────────────────────────┐
                         │      FEEDBACK SOURCES     │
                         │                           │
                         │ YouTube                   │
                         │ Google Business Profile   │
                         │ Google Play               │
                         │ Apple App Store           │
                         │ Support Systems           │
                         │ Surveys                   │
                         │ Communities               │
                         │ Custom APIs               │
                         └─────────────┬─────────────┘
                                       │
                                       ▼
                         ┌───────────────────────────┐
                         │    CONNECTOR LAYER        │
                         │                           │
                         │ OAuth / APIs / Webhooks   │
                         └─────────────┬─────────────┘
                                       │
                                       ▼
                         ┌───────────────────────────┐
                         │      FASTAPI BACKEND      │
                         │                           │
                         │ Authentication            │
                         │ Source Management         │
                         │ Feedback APIs             │
                         └─────────────┬─────────────┘
                                       │
                                       ▼
                         ┌───────────────────────────┐
                         │    REDIS + CELERY         │
                         │                           │
                         │ Background Processing     │
                         │ Scheduled Jobs             │
                         │ Queue Management           │
                         └─────────────┬─────────────┘
                                       │
                                       ▼
                         ┌───────────────────────────┐
                         │       POSTGRESQL          │
                         │                           │
                         │ Feedback                  │
                         │ Users                     │
                         │ Sources                   │
                         │ Metadata                  │
                         │ Problems                  │
                         └─────────────┬─────────────┘
                                       │
                                       ▼
                         ┌───────────────────────────┐
                         │       NLP PIPELINE        │
                         │                           │
                         │ Text Processing            │
                         │ Sentiment                  │
                         │ Intent                     │
                         │ Metadata Extraction        │
                         └─────────────┬─────────────┘
                                       │
                                       ▼
                         ┌───────────────────────────┐
                         │    EMBEDDING PIPELINE     │
                         │                           │
                         │ BGE Embeddings            │
                         └─────────────┬─────────────┘
                                       │
                                       ▼
                         ┌───────────────────────────┐
                         │       PGVECTOR            │
                         │                           │
                         │ Semantic Search            │
                         │ Similarity Retrieval       │
                         └─────────────┬─────────────┘
                                       │
                                       ▼
                         ┌───────────────────────────┐
                         │   PROBLEM DISCOVERY      │
                         │                           │
                         │ BERTopic                  │
                         │ HDBSCAN                   │
                         └─────────────┬─────────────┘
                                       │
                                       ▼
                         ┌───────────────────────────┐
                         │  TREND & PRIORITY ENGINE │
                         │                           │
                         │ Frequency                 │
                         │ Severity                  │
                         │ Growth                    │
                         │ User Impact               │
                         │ Sentiment                 │
                         └─────────────┬─────────────┘
                                       │
                                       ▼
                         ┌───────────────────────────┐
                         │        LLM LAYER          │
                         │                           │
                         │ Insight Generation        │
                         │ Evidence Synthesis        │
                         │ Response Generation       │
                         └─────────────┬─────────────┘
                                       │
                                       ▼
                         ┌───────────────────────────┐
                         │      NEXT.JS APP          │
                         │                           │
                         │ Dashboard                 │
                         │ Problem Explorer          │
                         │ Trends                    │
                         │ Evidence                  │
                         │ Responses                 │
                         └───────────────────────────┘
```

---

# 🔄 End-to-End Data Flow

```text
1. Company connects feedback sources
                ↓
2. Platform retrieves new feedback
                ↓
3. Feedback is normalized
                ↓
4. Duplicate/irrelevant records are filtered
                ↓
5. Feedback is stored
                ↓
6. NLP analyzes sentiment and intent
                ↓
7. Embeddings capture semantic meaning
                ↓
8. Similar feedback is discovered
                ↓
9. BERTopic/HDBSCAN identifies problem clusters
                ↓
10. Historical and current trends are calculated
                ↓
11. Problems receive evidence-based priority
                ↓
12. Important problems are passed to the LLM
                ↓
13. LLM generates evidence-backed insights
                ↓
14. Dashboard presents the problem and evidence
                ↓
15. Product team investigates and decides
                ↓
16. Optional AI-assisted response is generated
```

---

# 🧰 Technology Stack

## Frontend

* Next.js
* TypeScript
* Tailwind CSS
* shadcn/ui
* ECharts / Recharts

## Backend

* Python
* FastAPI
* Celery
* Redis

## Database

* PostgreSQL
* pgvector

## NLP / Machine Learning

* spaCy
* RoBERTa
* DistilBERT
* BGE
* BERTopic
* HDBSCAN

## Generative AI

* GPT-class LLM

## Infrastructure

* Docker
* AWS

## Integration

* REST APIs
* OAuth
* Webhooks
* Source-specific connectors

---

# 🧠 Why These Technologies?

| Requirement             | Technology          |
| ----------------------- | ------------------- |
| API backend             | FastAPI             |
| Continuous processing   | Celery + Redis      |
| Structured storage      | PostgreSQL          |
| Semantic search         | pgvector            |
| Sentiment               | RoBERTa             |
| Intent                  | DistilBERT          |
| Semantic representation | BGE                 |
| Problem discovery       | BERTopic            |
| Clustering              | HDBSCAN             |
| Product prioritization  | Explainable scoring |
| Insight generation      | LLM                 |
| Dashboard               | Next.js             |
| Deployment              | Docker + AWS        |

---

# 📐 Priority Engine

The initial system uses an interpretable scoring approach.

A problem can be evaluated using:

```text
Priority Score =
    Frequency
  + Severity
  + Growth
  + User Impact
  + Negative Sentiment
```

The actual weights can be configured according to the organization's requirements.

This approach is useful initially because the system does not require historical product-team decisions to train a supervised model.

### Future Learning Layer

Once sufficient historical decision data exists:

```text
Historical Feedback
        +
Historical Product Decisions
        ↓
Feature Engineering
        ↓
XGBoost
        ↓
Organization-Specific Priority Prediction
```

This allows the system to evolve from generic evidence-based prioritization toward organization-specific learned prioritization.

---

# ⚡ Scalability

The system is designed for asynchronous, distributed processing.

```text
Feedback Sources
       ↓
Message Queue
       ↓
Worker Pool
       ↓
NLP / Embeddings
       ↓
Database
       ↓
Analytics
       ↓
LLM
```

The architecture supports horizontal scaling by adding additional workers as feedback volume increases.

LLM calls are concentrated on **important aggregated problems rather than every individual feedback item**, reducing unnecessary inference cost.

---

# 🔐 Security & Privacy

The platform should support:

* OAuth-based authentication
* API-key protection
* Encrypted credentials
* Environment-based secrets
* Tenant isolation
* Role-based access control
* Audit logs
* Secure webhook validation
* Data retention controls
* Removal/anonymization of unnecessary personal information

---

# 🏢 Multi-Tenant Architecture

The platform is designed for multiple organizations.

```text
Organization
     │
     ├── Users
     ├── Products
     ├── Feedback Sources
     ├── Feedback
     ├── Problems
     └── Insights
```

Every organization's data is logically isolated.

This allows the platform to operate as a SaaS product rather than as a single-company analytics tool.

---

# 📁 Project Structure

```text
feedback-intelligence/
│
├── frontend/
│   ├── app/
│   ├── components/
│   ├── dashboard/
│   ├── hooks/
│   ├── lib/
│   └── services/
│
├── backend/
│   ├── app/
│   │   ├── api/
│   │   ├── auth/
│   │   ├── connectors/
│   │   ├── ingestion/
│   │   ├── normalization/
│   │   ├── nlp/
│   │   ├── embeddings/
│   │   ├── clustering/
│   │   ├── trends/
│   │   ├── priority/
│   │   ├── insights/
│   │   ├── responses/
│   │   ├── database/
│   │   └── models/
│   │
│   ├── workers/
│   └── main.py
│
├── ml/
│   ├── sentiment/
│   ├── intent/
│   ├── embeddings/
│   ├── clustering/
│   └── evaluation/
│
├── infrastructure/
│   ├── docker/
│   ├── nginx/
│   └── aws/
│
├── tests/
│   ├── unit/
│   ├── integration/
│   └── evaluation/
│
├── docker-compose.yml
├── .env.example
├── requirements.txt
├── LICENSE
└── README.md
```

---

# 🚀 Local Development

## Prerequisites

* Python 3.11+
* Node.js 20+
* PostgreSQL
* Redis
* Docker

## Clone

```bash
git clone <repository-url>
cd feedback-intelligence
```

## Environment

```bash
cp .env.example .env
```

Example:

```env
DATABASE_URL=
REDIS_URL=
LLM_API_KEY=

YOUTUBE_CLIENT_ID=
YOUTUBE_CLIENT_SECRET=

GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

APPLE_KEY_ID=
APPLE_ISSUER_ID=
```

## Start infrastructure

```bash
docker compose up -d
```

## Backend

```bash
cd backend

pip install -r requirements.txt

uvicorn app.main:app --reload
```

## Celery Worker

```bash
celery -A workers.celery_app worker --loglevel=info
```

## Frontend

```bash
cd frontend

npm install
npm run dev
>>>>>>> origin/main
```

---

<<<<<<< HEAD
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
=======
# 🧪 Testing

The project should include:

* Unit tests
* API tests
* Connector tests
* NLP evaluation
* Embedding evaluation
* Clustering evaluation
* Priority-engine tests
* LLM output validation
* Integration tests
* End-to-end tests

Example:

```bash
pytest
>>>>>>> origin/main
```

---

<<<<<<< HEAD
## 🎨 Design Philosophy & Aesthetics

- **Curated Color Palette**: Dark-mode primary background (`#0b0f19`) paired with glowing cyan/emerald telemetry accents and refined border highlights.
- **Glassmorphism & Depth**: Multi-layered cards with subtle backdrop blur, responsive hover micro-interactions, and fluid SVG charts.
- **Production-Ready UX**: Fast load times, zero external heavy framework overhead, and accessible semantic HTML.

---

## 🌿 Branch Overview

- **`prototype`** (Current): Dedicated purely to the interactive frontend client prototype and visual demonstrations.
- **`dev-rishi`**: Backend services, multi-channel API integrations, PostgreSQL schemas, and automated test suites.
=======
# 📊 Evaluation

The system can be evaluated using:

### NLP

* Accuracy
* Precision
* Recall
* F1-score

### Clustering

* Silhouette Score
* Topic coherence
* Human evaluation

### Retrieval

* Precision@K
* Recall@K
* Semantic similarity

### Priority

* Agreement with expert/product-team labels
* Ranking consistency
* Detection of emerging issues

### LLM

* Groundedness
* Evidence coverage
* Hallucination rate
* Human evaluation

---

# 🌍 Potential Applications

### SaaS

Identify recurring product bugs and feature requests.

### Mobile Applications

Understand reviews across app versions and platforms.

### Retail

Analyze customer feedback across multiple store locations.

### Restaurants

Identify recurring service, food, delivery, and customer-experience problems.

### Consumer Products

Aggregate reviews and discover recurring product defects or complaints.

### Media & Content

Understand audience reactions across videos and communities.

### Customer Support

Convert large-scale support conversations into product-level insights.

---

# 🔮 Future Scope

The platform can evolve toward:

* More source connectors
* Real-time streaming ingestion
* Multilingual feedback analysis
* Voice-feedback transcription
* Organization-specific taxonomies
* Automatic product-area mapping
* Advanced anomaly detection
* Learned prioritization using historical decisions
* Automated experiment recommendations
* Product-roadmap integration
* Jira / Linear / GitHub issue creation
* Human-in-the-loop response workflows
* Organization-specific AI agents

---

# 🎯 Core Product Philosophy

The platform is built around four principles:

### 1. Aggregate the Voice

Don't let isolated complaints represent the entire customer base.

### 2. Discover the Problem

Group different expressions of the same underlying issue.

### 3. Show the Evidence

Every important insight should be traceable to real customer feedback.

### 4. Support the Decision

Use AI to help product teams understand and act on the evidence.

---

# ⭐ Core Pipeline

```text
CONNECT
   ↓
COLLECT
   ↓
NORMALIZE
   ↓
UNDERSTAND
   ↓
EMBED
   ↓
CLUSTER
   ↓
DETECT TRENDS
   ↓
PRIORITIZE
   ↓
EXPLAIN
   ↓
RESPOND
   ↓
DECIDE
```

---

# 📄 License

MIT License
