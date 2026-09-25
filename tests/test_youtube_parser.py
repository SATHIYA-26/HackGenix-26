from datetime import datetime, timezone
from backend.app.integrations.youtube_api import (
    parse_comment_snippet,
    parse_comment_thread,
    parse_iso_datetime,
)


def test_parse_iso_datetime():
    dt = parse_iso_datetime("2024-03-01T12:34:56Z")
    assert dt.year == 2024
    assert dt.month == 3
    assert dt.day == 1
    assert dt.hour == 12
    assert dt.minute == 34
    assert dt.second == 56
    assert dt.tzinfo is not None

    # Fallback on None or invalid string
    dt_none = parse_iso_datetime(None)
    assert isinstance(dt_none, datetime)
    dt_invalid = parse_iso_datetime("invalid-date-format")
    assert isinstance(dt_invalid, datetime)


def test_parse_top_level_comment_snippet():
    raw_comment = {
        "id": "Ugx_sample_123",
        "snippet": {
            "authorDisplayName": "Alice Developer",
            "authorProfileImageUrl": "https://example.com/alice.jpg",
            "authorChannelUrl": "http://www.youtube.com/channel/UC123",
            "authorChannelId": {"value": "UC123"},
            "videoId": "vid_xyz",
            "textDisplay": "Excellent video!",
            "textOriginal": "Excellent video!",
            "likeCount": 42,
            "publishedAt": "2024-03-01T12:00:00Z",
            "updatedAt": "2024-03-01T12:05:00Z",
        },
    }

    normalized = parse_comment_snippet(raw_comment, video_id="vid_xyz", parent_id=None)

    assert normalized["source"] == "youtube"
    assert normalized["source_type"] == "comment"
    assert normalized["external_id"] == "Ugx_sample_123"
    assert normalized["parent_external_id"] is None
    assert normalized["author_name"] == "Alice Developer"
    assert normalized["author_url"] == "http://www.youtube.com/channel/UC123"
    assert normalized["text"] == "Excellent video!"
    assert normalized["rating"] is None
    assert normalized["rating_scale"] is None
    assert normalized["source_url"] == "https://www.youtube.com/watch?v=vid_xyz&lc=Ugx_sample_123"
    assert normalized["metadata"]["video_id"] == "vid_xyz"
    assert normalized["metadata"]["like_count"] == 42
    assert normalized["metadata"]["author_channel_id"] == "UC123"
    assert normalized["metadata"]["is_reply"] is False


def test_parse_reply_comment_snippet():
    raw_reply = {
        "id": "reply_456",
        "snippet": {
            "parentId": "Ugx_sample_123",
            "authorDisplayName": "Bob Reviewer",
            "authorProfileImageUrl": "https://example.com/bob.jpg",
            "authorChannelUrl": "http://www.youtube.com/channel/UC456",
            "authorChannelId": {"value": "UC456"},
            "videoId": "vid_xyz",
            "textDisplay": "I completely agree!",
            "textOriginal": "I completely agree!",
            "likeCount": 5,
            "publishedAt": "2024-03-01T14:00:00Z",
            "updatedAt": "2024-03-01T14:00:00Z",
        },
    }

    normalized = parse_comment_snippet(raw_reply, video_id="vid_xyz", parent_id="Ugx_sample_123")

    assert normalized["source"] == "youtube"
    assert normalized["source_type"] == "comment"
    assert normalized["external_id"] == "reply_456"
    assert normalized["parent_external_id"] == "Ugx_sample_123"
    assert normalized["author_name"] == "Bob Reviewer"
    assert normalized["text"] == "I completely agree!"
    assert normalized["metadata"]["is_reply"] is True
    assert normalized["metadata"]["like_count"] == 5


def test_parse_comment_thread(youtube_comment_threads_page1):
    thread_item = youtube_comment_threads_page1["items"][0]
    top_comment, replies, total_reply_count = parse_comment_thread(thread_item, video_id="vid123")

    assert top_comment["external_id"] == "comment_1"
    assert top_comment["author_name"] == "Alice Wonder"
    assert top_comment["text"] == "Super helpful walkthrough, loved the explanation!"
    assert total_reply_count == 1
    assert len(replies) == 1

    reply = replies[0]
    assert reply["external_id"] == "reply_1_1"
    assert reply["parent_external_id"] == "comment_1"
    assert reply["author_name"] == "Bob Builder"
    assert reply["text"] == "Same here, the demo was crystal clear."
