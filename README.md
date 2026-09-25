# Feedback Intelligence — Module 1: YouTube Comments Integration

Feedback Intelligence is a multi-source feedback collection and intelligence SaaS platform designed to aggregate raw customer feedback across platforms (YouTube comments, Google Maps reviews, Google Play Store app reviews, and Instagram comments) into a unified normalized schema for downstream analytics, sentiment tracking, topic modeling, and product insights.

**Module 1** delivers the production integration for **YouTube Comments** using the official Google YouTube Data API v3.

---

## Architecture Overview

```
YouTube Video / Channel
         │
         ▼  (Official YouTube Data API v3 via HTTPX)
commentThreads.list & comments.list
         │
         ▼
YouTubeSyncService (Normalization & Deduplication)
         │
         ▼
PostgreSQL (businesses, youtube_videos, youtube_channels, feedback)
```

---

## 1. What the Project Does

- **Real YouTube Data API v3 Ingestion**: Fetches top-level comments and replies directly from YouTube without scraping or browser automation.
- **Normalized Data Architecture**: Unifies YouTube comments into a cross-platform `feedback` schema ready for upcoming integrations (Google Maps, Google Play, Instagram).
- **Idempotency & Deduplication**: Guarantees zero duplicate entries on repeated synchronization cycles using composite business and external ID constraints.
- **Complete Reply Pagination**: Ingests both snippet-embedded replies and deeply nested comment threads via paginated `comments.list` requests.
- **RESTful Management Endpoints**: Create businesses, trigger video synchronization runs, and fetch paginated feedback streams.

---

## 2. How to Create a Google Cloud Project

1. Navigate to the [Google Cloud Console](https://console.cloud.google.com/).
2. Click the project dropdown at the top of the page and select **New Project**.
3. Enter a **Project Name** (e.g., `feedback-intelligence-prod`) and choose your organization/billing account.
4. Click **Create** and wait for the project initialization to complete.
5. Select your newly created project from the top dropdown.

---

## 3. How to Enable YouTube Data API v3

1. In the Google Cloud Console, open the left navigation menu and navigate to **APIs & Services** > **Library**.
2. Search for **"YouTube Data API v3"**.
3. Click on **YouTube Data API v3** from the search results.
4. Click the **Enable** button.

---

## 4. How to Create and Configure `YOUTUBE_API_KEY`

1. In Google Cloud Console, go to **APIs & Services** > **Credentials**.
2. Click **+ Create Credentials** at the top and select **API Key**.
3. Copy the generated API Key.
4. *(Recommended Security Practice)* Click **Edit API Key**:
   - Under **API restrictions**, select **Restrict key**.
   - Check **YouTube Data API v3**.
   - Click **Save**.
5. Set this key in your `.env` file as `YOUTUBE_API_KEY=your_copied_api_key`.

---

## 5. Environment Variables

Create a `.env` file in the root directory from `.env.example`:

```bash
cp .env.example .env
```

Configure the following variables:

```ini
# PostgreSQL Database URL (psycopg3 or psycopg2)
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/feedback_intelligence

# Official Google YouTube Data API v3 Key
YOUTUBE_API_KEY=AIzaSy...your_actual_key...

# Application Environment
ENVIRONMENT=development
PROJECT_NAME="Feedback Intelligence"
API_V1_STR=/api/v1
```

---

## 6. PostgreSQL Setup (Docker Compose)

Start the PostgreSQL 16 database container with healthchecks and persistent storage:

```bash
docker compose up -d
```

To stop the database:
```bash
docker compose down
```

---

## 7. Database Migrations (Alembic)

Apply database migrations to create `businesses`, `youtube_channels`, `youtube_videos`, and `feedback` tables:

```bash
# Run migrations to the latest revision
alembic upgrade head
```

To rollback a migration:
```bash
alembic downgrade -1
```

---

## 8. Start FastAPI Server

Activate your virtual environment and run the Uvicorn development server:

```bash
# Windows PowerShell
.\.venv\Scripts\uvicorn backend.app.main:app --reload --port 8000

# Linux/macOS
uvicorn backend.app.main:app --reload --port 8000
```

- API Documentation (Swagger UI): [http://localhost:8000/docs](http://localhost:8000/docs)
- Alternative API Documentation (ReDoc): [http://localhost:8000/redoc](http://localhost:8000/redoc)
- Health Check: [http://localhost:8000/health](http://localhost:8000/health)

---

## 9. Sync Comments for a Real YouTube Video

### Step 1: Create a Business
```bash
curl -X POST "http://localhost:8000/api/v1/businesses" \
     -H "Content-Type: application/json" \
     -d '{"name": "My SaaS Product"}'
```

Response:
```json
{
  "name": "My SaaS Product",
  "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "created_at": "2026-09-25T12:00:00Z",
  "updated_at": "2026-09-25T12:00:00Z"
}
```

### Step 2: Trigger YouTube Video Sync
Provide a real YouTube Video ID (e.g. `jNQXAC9IVRw`):

```bash
curl -X POST "http://localhost:8000/api/v1/youtube/videos/jNQXAC9IVRw/sync" \
     -H "Content-Type: application/json" \
     -d '{"business_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6"}'
```

Response:
```json
{
  "status": "success",
  "video_id": "jNQXAC9IVRw",
  "comments_fetched": 100,
  "comments_inserted": 100,
  "duplicates": 0
}
```

Running the exact same request again will demonstrate complete deduplication:
```json
{
  "status": "success",
  "video_id": "jNQXAC9IVRw",
  "comments_fetched": 100,
  "comments_inserted": 0,
  "duplicates": 100
}
```

---

## 10. Retrieve Stored Comments

Query the stored, normalized comments for a business:

```bash
curl -X GET "http://localhost:8000/api/v1/businesses/3fa85f64-5717-4562-b3fc-2c963f66afa6/youtube-comments?page=1&page_size=20"
```

Response:
```json
{
  "total": 100,
  "page": 1,
  "page_size": 20,
  "total_pages": 5,
  "items": [
    {
      "id": "e8d7a123-...",
      "business_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      "source": "youtube",
      "source_type": "comment",
      "external_id": "UgxK91a...",
      "parent_external_id": null,
      "author_name": "John Doe",
      "author_url": "http://www.youtube.com/channel/...",
      "text": "Great walkthrough!",
      "rating": null,
      "rating_scale": null,
      "created_at": "2024-03-01T12:00:00Z",
      "updated_at": null,
      "source_url": "https://www.youtube.com/watch?v=jNQXAC9IVRw&lc=UgxK91a...",
      "metadata": {
        "video_id": "jNQXAC9IVRw",
        "like_count": 4,
        "total_reply_count": 2,
        "is_reply": false
      },
      "ingested_at": "2026-09-25T12:15:00Z"
    }
  ]
}
```

---

## 11. YouTube Data API v3 Quota Basics

| Resource Call | Quota Cost (Units) |
|---|---|
| `commentThreads.list` | **1 unit** |
| `comments.list` | **1 unit** |
| `videos.list` | **1 unit** |

- **Default Daily Free Quota**: 10,000 units per project per day (resets midnight Pacific Time).
- **Efficiency**: Fetching 100 comments via `commentThreads.list` with `maxResults=100` consumes only **1 unit** of quota.
- **Handling Quota Errors**: If quota is exceeded, the backend cleanly returns HTTP `429 Too Many Requests` with `{"error": "QuotaExceeded"}`.
- **Rate Limit & Backoff**: When scheduled for recurring synchronization every 2 hours, requests are batched and deduplicated to preserve quota.

---

## Running the Automated Test Suite

Run the full pytest suite:

```bash
pytest -v
```
