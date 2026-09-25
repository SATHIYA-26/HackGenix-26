import uuid
import pytest
from unittest.mock import MagicMock
from sqlalchemy import select

from backend.app.core.exceptions import EntityNotFoundError
from backend.app.models.business import Business
from backend.app.models.feedback import Feedback
from backend.app.models.youtube import YouTubeChannel, YouTubeVideo
from backend.app.services.youtube import YouTubeSyncService


def test_sync_video_comments_with_pagination(
    db_session,
    sample_business,
    youtube_comment_threads_page1,
    youtube_comment_threads_page2,
    youtube_video_details_response,
):
    # Mock YouTubeApiClient
    mock_api_client = MagicMock()
    mock_api_client.get_video_details.return_value = youtube_video_details_response["items"][0]
    
    # Mock get_comment_threads pagination: page 1 returns next_token, page 2 returns None
    def side_effect_get_threads(video_id, page_token=None, max_results=100):
        if page_token is None:
            return youtube_comment_threads_page1
        elif page_token == "token_page_2":
            return youtube_comment_threads_page2
        return {"items": []}

    mock_api_client.get_comment_threads.side_effect = side_effect_get_threads
    mock_api_client.get_comment_replies.return_value = {"items": []}

    sync_service = YouTubeSyncService(db=db_session, api_client=mock_api_client)

    # First sync run
    result = sync_service.sync_video_comments(
        business_id=sample_business.id,
        video_id="vid123",
    )

    # Total comments:
    # Page 1: 2 top-level + 1 embedded reply = 3
    # Page 2: 1 top-level = 1
    # Total = 4
    assert result.status == "success"
    assert result.video_id == "vid123"
    assert result.comments_fetched == 4
    assert result.comments_inserted == 4
    assert result.duplicates == 0

    # Verify records in database
    feedbacks = db_session.scalars(select(Feedback).where(Feedback.business_id == sample_business.id)).all()
    assert len(feedbacks) == 4

    # Verify video and channel records were created
    videos = db_session.scalars(select(YouTubeVideo).where(YouTubeVideo.business_id == sample_business.id)).all()
    assert len(videos) == 1
    assert videos[0].youtube_video_id == "vid123"
    assert videos[0].title == "FastAPI & YouTube Data API Tutorial"

    channels = db_session.scalars(select(YouTubeChannel).where(YouTubeChannel.business_id == sample_business.id)).all()
    assert len(channels) == 1
    assert channels[0].youtube_channel_id == "UC_channel123"
    assert channels[0].channel_name == "Tech Academy"


def test_sync_video_comments_with_external_replies_pagination(
    db_session,
    sample_business,
    youtube_video_details_response,
):
    # Scenario: Thread has totalReplyCount = 3, but embedded replies only has 1.
    # The sync service will fetch the remaining replies using comments.list!
    mock_api_client = MagicMock()
    mock_api_client.get_video_details.return_value = youtube_video_details_response["items"][0]
    
    mock_api_client.get_comment_threads.return_value = {
        "items": [
            {
                "kind": "youtube#commentThread",
                "id": "thread_parent",
                "snippet": {
                    "videoId": "vid_reply_test",
                    "topLevelComment": {
                        "id": "parent_comment_1",
                        "snippet": {
                            "authorDisplayName": "Parent Author",
                            "videoId": "vid_reply_test",
                            "textDisplay": "What do you think?",
                            "likeCount": 10,
                            "publishedAt": "2024-03-01T12:00:00Z",
                        },
                    },
                    "totalReplyCount": 3,
                    "canReply": True,
                    "isPublic": True,
                },
                "replies": {
                    "comments": [
                        {
                            "id": "reply_embedded_1",
                            "snippet": {
                                "parentId": "parent_comment_1",
                                "authorDisplayName": "Reply Author 1",
                                "textDisplay": "I think it is great!",
                                "publishedAt": "2024-03-01T12:10:00Z",
                            },
                        }
                    ]
                },
            }
        ],
        "nextPageToken": None,
    }

    # comments.list returns the full set including reply_2 and reply_3
    mock_api_client.get_comment_replies.return_value = {
        "items": [
            {
                "id": "reply_embedded_1",
                "snippet": {
                    "parentId": "parent_comment_1",
                    "authorDisplayName": "Reply Author 1",
                    "textDisplay": "I think it is great!",
                    "publishedAt": "2024-03-01T12:10:00Z",
                },
            },
            {
                "id": "reply_external_2",
                "snippet": {
                    "parentId": "parent_comment_1",
                    "authorDisplayName": "Reply Author 2",
                    "textDisplay": "Me too!",
                    "publishedAt": "2024-03-01T12:20:00Z",
                },
            },
            {
                "id": "reply_external_3",
                "snippet": {
                    "parentId": "parent_comment_1",
                    "authorDisplayName": "Reply Author 3",
                    "textDisplay": "Count me in!",
                    "publishedAt": "2024-03-01T12:30:00Z",
                },
            },
        ],
        "nextPageToken": None,
    }

    sync_service = YouTubeSyncService(db=db_session, api_client=mock_api_client)
    result = sync_service.sync_video_comments(
        business_id=sample_business.id,
        video_id="vid_reply_test",
    )

    # 1 top-level + 1 embedded reply + 2 additional external replies = 4 total
    assert result.comments_fetched == 4
    assert result.comments_inserted == 4
    assert result.duplicates == 0

    feedbacks = db_session.scalars(select(Feedback).where(Feedback.business_id == sample_business.id)).all()
    assert len(feedbacks) == 4
    ext_ids = {f.external_id for f in feedbacks}
    assert ext_ids == {"parent_comment_1", "reply_embedded_1", "reply_external_2", "reply_external_3"}


def test_sync_idempotency_and_duplicate_prevention(
    db_session,
    sample_business,
    youtube_comment_threads_page1,
    youtube_video_details_response,
):
    mock_api_client = MagicMock()
    mock_api_client.get_video_details.return_value = youtube_video_details_response["items"][0]
    mock_api_client.get_comment_threads.return_value = {
        "items": [youtube_comment_threads_page1["items"][0]],  # 1 top-level + 1 reply = 2
        "nextPageToken": None,
    }
    mock_api_client.get_comment_replies.return_value = {"items": []}

    sync_service = YouTubeSyncService(db=db_session, api_client=mock_api_client)

    # Run 1: 2 inserted
    res1 = sync_service.sync_video_comments(business_id=sample_business.id, video_id="vid123")
    assert res1.comments_fetched == 2
    assert res1.comments_inserted == 2
    assert res1.duplicates == 0

    # Run 2: Exact same video & comments
    res2 = sync_service.sync_video_comments(business_id=sample_business.id, video_id="vid123")
    assert res2.comments_fetched == 2
    assert res2.comments_inserted == 0
    assert res2.duplicates == 2

    # Database still has exactly 2 records
    feedbacks = db_session.scalars(select(Feedback).where(Feedback.business_id == sample_business.id)).all()
    assert len(feedbacks) == 2


def test_sync_nonexistent_business_raises_error(db_session):
    sync_service = YouTubeSyncService(db=db_session, api_client=MagicMock())
    fake_business_id = uuid.uuid4()

    with pytest.raises(EntityNotFoundError) as exc_info:
        sync_service.sync_video_comments(business_id=fake_business_id, video_id="vid123")
    assert "does not exist" in str(exc_info.value.message)


def test_get_stored_comments_pagination(db_session, sample_business):
    sync_service = YouTubeSyncService(db=db_session, api_client=MagicMock())

    # Create 5 dummy feedback items directly in DB
    from datetime import datetime, timezone, timedelta
    for i in range(5):
        fb = Feedback(
            business_id=sample_business.id,
            source="youtube",
            source_type="comment",
            external_id=f"comment_{i}",
            parent_external_id=None if i % 2 == 0 else "comment_0",
            author_name=f"User {i}",
            text=f"Feedback content {i}",
            created_at=datetime.now(timezone.utc) + timedelta(minutes=i),
        )
        db_session.add(fb)
    db_session.commit()

    # Query page 1 with page_size=2
    items, total, total_pages = sync_service.get_stored_comments(
        business_id=sample_business.id,
        page=1,
        page_size=2,
    )
    assert total == 5
    assert total_pages == 3
    assert len(items) == 2

    # Filter parent_only
    parent_items, parent_total, _ = sync_service.get_stored_comments(
        business_id=sample_business.id,
        page=1,
        page_size=10,
        parent_only=True,
    )
    # indices 0, 2, 4 are parent comments
    assert parent_total == 3
    assert len(parent_items) == 3
