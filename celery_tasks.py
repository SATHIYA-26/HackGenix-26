"""
Celery + Redis 2-Hour Scheduled Worker for YouTube Channel Intelligence
-----------------------------------------------------------------------
This worker fetches comments from the last 3 published videos (50 comments each)
every 2 hours and computes real-time NLP sentiment statistics.

Usage:
1. Start Redis:
   docker run -d -p 6379:6379 --name redis-reviewr redis:7-alpine

2. Run Celery Worker:
   celery -A celery_tasks worker --loglevel=info

3. Run Celery Beat Scheduler (triggers every 2 hours):
   celery -A celery_tasks beat --loglevel=info

4. Trigger manually anytime from CLI:
   python celery_tasks.py --now
"""

import os
import sys
import re
import json
import urllib.request
import urllib.parse
from datetime import datetime

# Configure UTF-8 output encoding for multi-lingual and Windows terminals
if hasattr(sys.stdout, "reconfigure"):
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

from celery import Celery
from celery.schedules import crontab

# ─── CONFIGURATION & ENVIRONMENT ───
REDIS_URL = os.getenv("REDIS_URL", os.getenv("CELERY_BROKER_URL", "redis://localhost:6379/0"))
YOUTUBE_API_KEY = os.getenv("YOUTUBE_API_KEY", "AIzaSyDzQb1VCSM7VQf47RnGPYHMq2bj6ZlVNJk")
DEFAULT_CHANNEL_HANDLE = os.getenv("YOUTUBE_CHANNEL_HANDLE", "@VJ_Sidhu_Vlogs")
BACKEND_NLP_URL = os.getenv("BACKEND_NLP_URL", "http://127.0.0.1:8000/api/nlp/process-youtube")

# Initialize Celery App
celery_app = Celery(
    "youtube_channel_scheduler",
    broker=REDIS_URL,
    backend=REDIS_URL
)

# Celery Beat Schedule Configuration: Every 2 Hours
celery_app.conf.beat_schedule = {
    "refresh-youtube-channel-stats-every-2-hours": {
        "task": "tasks.refresh_youtube_channel_stats",
        "schedule": crontab(minute=0, hour="*/2"),  # Every 2 hours on the hour (e.g. 0:00, 2:00, 4:00...)
        "args": (DEFAULT_CHANNEL_HANDLE, 3, 50),     # Last 3 videos, 50 comments each
    },
}
celery_app.conf.timezone = "UTC"


def extract_sentiment(text):
    """Rule-based sentiment helper with NLP scoring fallback."""
    lower = text.lower()
    pos_words = ["great", "good", "love", "awesome", "excellent", "best", "super", "fire", "amazing", "well played", "proud", "pure", "fun", "hilarious", "top", "nice", "enjoy", "legend", "win", "happy", "thank", "king", "queen", "champion"]
    neg_words = ["bad", "worst", "hate", "terrible", "poor", "slow", "horrible", "delay", "crash", "bug", "issue", "problem", "fail", "freeze", "disappoint", "waste", "trash", "scam", "stupid"]

    pos = sum(1 for w in pos_words if w in lower)
    neg = sum(1 for w in neg_words if w in lower)

    if pos > neg:
        return "positive", 0.85
    elif neg > pos:
        return "negative", -0.75
    return "neutral", 0.10


def http_get_json(url):
    req = urllib.request.Request(url, headers={"User-Agent": "Reviewr-Celery-Worker/1.0"})
    with urllib.request.urlopen(req, timeout=15) as resp:
        return json.loads(resp.read().decode("utf-8"))


def fetch_channel_recent_videos_comments(channel_handle=DEFAULT_CHANNEL_HANDLE, max_videos=3, comments_per_video=50):
    """
    Fetches the last N videos from channel_handle, and up to M comments per video.
    Computes cross-video aggregated stats.
    """
    print(f"[*] [Celery 2-Hour Sync] Resolving channel: {channel_handle}...")
    api_key = YOUTUBE_API_KEY
    if not api_key:
        raise ValueError("YOUTUBE_API_KEY is not set.")

    # 1. Resolve Channel ID
    clean_handle = channel_handle.strip()
    if not clean_handle.startswith("@"):
        clean_handle = f"@{clean_handle}"

    search_url = f"https://www.googleapis.com/youtube/v3/search?part=snippet&q={urllib.parse.quote(clean_handle)}&type=channel&maxResults=1&key={api_key}"
    search_data = http_get_json(search_url)

    items = search_data.get("items", [])
    if not items:
        raise ValueError(f"Channel '{clean_handle}' not found on YouTube.")

    channel_id = items[0]["snippet"]["channelId"]
    channel_title = items[0]["snippet"]["title"]
    channel_avatar = items[0]["snippet"]["thumbnails"]["default"]["url"]

    print(f"[+] Found Channel: '{channel_title}' (ID: {channel_id})")

    # 2. Fetch Latest 3 Videos
    print(f"[*] Fetching latest {max_videos} videos...")
    videos_url = f"https://www.googleapis.com/youtube/v3/search?part=snippet&channelId={channel_id}&type=video&order=date&maxResults={max_videos}&key={api_key}"
    videos_data = http_get_json(videos_url)

    video_items = videos_data.get("items", [])
    all_comments = []
    video_summaries = []

    pos_total = 0
    neg_total = 0
    neu_total = 0
    likes_total = 0

    for idx, v in enumerate(video_items):
        vid_id = v["id"]["videoId"]
        vid_title = v["snippet"]["title"]
        vid_thumb = v["snippet"]["thumbnails"].get("medium", {}).get("url", "")
        vid_date = v["snippet"]["publishedAt"]

        print(f"  -> [{idx+1}/{len(video_items)}] Processing Video: '{vid_title}' ({vid_id})...")

        # Fetch comments for this video (up to comments_per_video)
        comments_url = f"https://www.googleapis.com/youtube/v3/commentThreads?part=snippet,replies&videoId={vid_id}&maxResults={min(comments_per_video, 100)}&textFormat=plainText&key={api_key}"
        try:
            comm_data = http_get_json(comments_url)
        except Exception as e:
            print(f"     [!] Warning: Failed to fetch comments for {vid_id} ({e})")
            continue

        raw_threads = comm_data.get("items", [])
        video_extracted = 0
        v_pos, v_neg, v_neu = 0, 0, 0

        for thread in raw_threads:
            if video_extracted >= comments_per_video:
                break

            top = thread["snippet"]["topLevelComment"]["snippet"]
            top_id = thread["snippet"]["topLevelComment"]["id"]
            text = top.get("textOriginal", top.get("textDisplay", ""))

            if text.strip():
                sentiment, score = extract_sentiment(text)
                if sentiment == "positive":
                    v_pos += 1
                elif sentiment == "negative":
                    v_neg += 1
                else:
                    v_neu += 1

                like_cnt = top.get("likeCount", 0)
                likes_total += like_cnt

                all_comments.append({
                    "id": f"yt_{top_id}",
                    "text": text.strip(),
                    "authorName": top.get("authorDisplayName", "Anonymous"),
                    "authorAvatar": top.get("authorProfileImageUrl", ""),
                    "likeCount": like_cnt,
                    "createdAt": top.get("publishedAt", ""),
                    "videoId": vid_id,
                    "videoTitle": vid_title,
                    "source": f"YouTube · {vid_title[:35]}...",
                    "sourceUrl": f"https://www.youtube.com/watch?v={vid_id}&lc={top_id}",
                    "sentiment": sentiment,
                    "score": score,
                })
                video_extracted += 1

        v_net = round(((v_pos - v_neg) / max(1, video_extracted)) * 100)
        video_summaries.append({
            "id": vid_id,
            "title": vid_title,
            "thumbnail": vid_thumb,
            "publishedAt": vid_date,
            "commentsCount": video_extracted,
            "netSentiment": f"{'+' if v_net >= 0 else ''}{v_net}%",
            "positiveCount": v_pos,
            "negativeCount": v_neg,
            "neutralCount": v_neu,
        })
        pos_total += v_pos
        neg_total += v_neg
        neu_total += v_neu

    total_comments = len(all_comments)
    net_score = round(((pos_total - neg_total) / max(1, total_comments)) * 100) if total_comments > 0 else 0

    stats = {
        "syncTimestamp": datetime.utcnow().isoformat() + "Z",
        "cadence": "2 Hours (Celery Beat Scheduled)",
        "channelTitle": channel_title,
        "channelId": channel_id,
        "channelHandle": clean_handle,
        "channelAvatar": channel_avatar,
        "videosAnalyzedCount": len(video_summaries),
        "totalCommentsExtracted": total_comments,
        "netSentiment": f"{'+' if net_score >= 0 else ''}{net_score}%",
        "positiveCount": pos_total,
        "positivePct": round((pos_total / max(1, total_comments)) * 100),
        "neutralCount": neu_total,
        "neutralPct": round((neu_total / max(1, total_comments)) * 100),
        "negativeCount": neg_total,
        "negativePct": round((neg_total / max(1, total_comments)) * 100),
        "totalLikes": likes_total,
        "avgLikesPerComment": f"{(likes_total / max(1, total_comments)):.1f}" if total_comments > 0 else "0.0",
        "topLikedComments": sorted(all_comments, key=lambda x: x["likeCount"], reverse=True)[:5],
    }

    result = {
        "success": True,
        "stats": stats,
        "videos": video_summaries,
        "comments": all_comments,
    }

    # Save to local JSON output
    out_file = "youtube_comments_output.json"
    with open(out_file, "w", encoding="utf-8") as f:
        json.dump(result, f, indent=2, ensure_ascii=False)
    print(f"[+] [Celery 2-Hour Sync] Ingested {total_comments} comments across {len(video_summaries)} videos. Saved to '{out_file}'.")

    # Optional: Forward to backend NLP service if running
    try:
        req = urllib.request.Request(
            BACKEND_NLP_URL,
            data=json.dumps(result).encode("utf-8"),
            headers={"Content-Type": "application/json"}
        )
        with urllib.request.urlopen(req, timeout=3) as r:
            print(f"[+] Forwarded 2-hour sync batch to NLP Backend at {BACKEND_NLP_URL}")
    except Exception:
        pass

    return result


@celery_app.task(name="tasks.refresh_youtube_channel_stats")
def refresh_youtube_channel_stats(channel_handle=DEFAULT_CHANNEL_HANDLE, max_videos=3, comments_per_video=50):
    """
    Celery Task executed every 2 hours by Celery Beat.
    Retrieves comments from the last 3 videos (50 comments each = 150 comments) and calculates stats.
    """
    print(f"[*] Starting Celery scheduled task: refresh_youtube_channel_stats for {channel_handle} (3 videos x 50 comments)...")
    return fetch_channel_recent_videos_comments(channel_handle, max_videos, comments_per_video)


if __name__ == "__main__":
    import sys
    handle = sys.argv[1] if len(sys.argv) > 1 and not sys.argv[1].startswith("--") else DEFAULT_CHANNEL_HANDLE
    print("=" * 65)
    print(f"[*] Running Manual 2-Hour YouTube Refresh (Last 3 Videos x 50 Comments)")
    print(f"[*] Channel Handle: {handle}")
    print("=" * 65)
    res = fetch_channel_recent_videos_comments(channel_handle=handle, max_videos=3, comments_per_video=50)
    print(f"\n[+] SUCCESS: Net Sentiment: {res['stats']['netSentiment']} | Extracted: {res['stats']['totalCommentsExtracted']} comments.")
