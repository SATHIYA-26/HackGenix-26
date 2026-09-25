from datetime import datetime, timezone
import pytest

from app.schemas.feedback import FeedbackInput
from app.connectors.youtube import YouTubeConnector
from app.connectors.google_play import GooglePlayConnector
from app.connectors.app_store import AppStoreConnector
from app.connectors.zendesk import ZendeskConnector
from app.connectors.custom_api import CustomAPIConnector
from app.connectors.registry import connector_registry


def test_youtube_connector_normalization():
    connector = YouTubeConnector()

    raw_youtube_payload = {
        "id": "yt_comm_987",
        "snippet": {
            "videoId": "vid_xyz123",
            "topLevelComment": {
                "snippet": {
                    "textDisplay": "The new update completely broke search! Please fix it ASAP.",
                    "authorDisplayName": "TechReviewer",
                    "likeCount": 42,
                    "publishedAt": "2026-09-24T14:30:00Z",
                }
            }
        }
    }

    canonical = connector.transform(raw_youtube_payload)

    assert isinstance(canonical, FeedbackInput)
    assert canonical.feedback_id == "yt_comm_987"
    assert canonical.source == "youtube"
    assert canonical.text == "The new update completely broke search! Please fix it ASAP."
    assert "https://www.youtube.com/watch?v=vid_xyz123" in canonical.source_url
    assert canonical.metadata["author"] == "TechReviewer"
    assert canonical.metadata["like_count"] == 42
    assert canonical.created_at.year == 2026


def test_google_play_connector_normalization():
    connector = GooglePlayConnector()

    raw_play_payload = {
        "reviewId": "gp_rev_554",
        "package_name": "com.myapp.android",
        "comments": [
            {
                "userComment": {
                    "text": "App crashes immediately after opening login screen.",
                    "starRating": 1,
                    "reviewerLanguage": "en",
                    "appVersionName": "v3.8.0",
                    "deviceMetadata": {"productName": "Pixel 8 Pro"},
                    "lastModified": {"seconds": 1727180000},
                }
            }
        ]
    }

    canonical = connector.transform(raw_play_payload)

    assert isinstance(canonical, FeedbackInput)
    assert canonical.feedback_id == "gp_rev_554"
    assert canonical.source == "google_play"
    assert canonical.text == "App crashes immediately after opening login screen."
    assert canonical.rating == 1.0
    assert canonical.metadata["platform"] == "Android"
    assert canonical.metadata["app_version"] == "v3.8.0"
    assert canonical.metadata["device"] == "Pixel 8 Pro"


def test_app_store_connector_normalization():
    connector = AppStoreConnector()

    raw_apple_payload = {
        "id": "as_rev_301",
        "attributes": {
            "title": "Very Disappointed",
            "body": "Subscription was charged twice and restore purchase fails.",
            "rating": 1,
            "createdDate": "2026-09-22T08:00:00Z",
            "reviewerNickname": "JohnD",
        },
        "app_version": "2.4.1",
    }

    canonical = connector.transform(raw_apple_payload)

    assert isinstance(canonical, FeedbackInput)
    assert canonical.feedback_id == "as_rev_301"
    assert canonical.source == "app_store"
    assert "Subscription was charged twice" in canonical.text
    assert canonical.rating == 1.0
    assert canonical.metadata["platform"] == "iOS"
    assert canonical.metadata["app_version"] == "2.4.1"


def test_zendesk_connector_normalization():
    connector = ZendeskConnector()

    raw_zendesk_payload = {
        "ticket": {
            "id": 10452,
            "subject": "Billing issue with recurring plan",
            "description": "I canceled my subscription last week but was billed again today.",
            "priority": "high",
            "created_at": "2026-09-25T11:00:00Z",
            "satisfaction_rating": {"score": "bad"},
            "tags": ["billing", "churn_risk"],
        },
        "subdomain": "acmehelp",
    }

    canonical = connector.transform(raw_zendesk_payload)

    assert isinstance(canonical, FeedbackInput)
    assert canonical.feedback_id == "10452"
    assert canonical.source == "support_ticket"
    assert "Billing issue with recurring plan" in canonical.text
    assert canonical.rating == 1.0  # Mapped from "bad"
    assert canonical.metadata["priority"] == "high"
    assert "https://acmehelp.zendesk.com/agent/tickets/10452" == canonical.source_url


def test_connector_registry_and_boundary_decoupling():
    # Downstream NLP and intelligence should ONLY accept FeedbackInput
    sources = [
        ("youtube", {"id": "yt_1", "text": "Great video!"}),
        ("google_play", {"reviewId": "gp_1", "text": "Good app", "rating": 5}),
        ("custom_api", {"id": "cust_1", "text": "Webhook received", "rating": 4}),
    ]

    for source_name, raw_data in sources:
        canonical = connector_registry.normalize(source_name, raw_data)
        assert isinstance(canonical, FeedbackInput)
        assert isinstance(canonical.text, str)
        assert len(canonical.text) > 0
        assert canonical.source == source_name
