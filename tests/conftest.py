import uuid
from datetime import datetime, timezone
from typing import Generator
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.pool import StaticPool

from backend.app.api.deps import get_db
from backend.app.db.base import Base
from backend.app.main import app
from backend.app.models.business import Business
from backend.app.models.feedback import Feedback
from backend.app.models.youtube import YouTubeChannel, YouTubeVideo

# SQLite in-memory test database
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture(scope="function")
def db_session() -> Generator[Session, None, None]:
    """Provides a clean database session per test function."""
    Base.metadata.create_all(bind=engine)
    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.close()
        Base.metadata.drop_all(bind=engine)


@pytest.fixture(scope="function")
def client(db_session: Session) -> Generator[TestClient, None, None]:
    """FastAPI TestClient with overridden database session."""
    def override_get_db():
        try:
            yield db_session
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()


@pytest.fixture
def sample_business(db_session: Session) -> Business:
    """Creates a sample business record in DB."""
    business = Business(name="Acme Corp")
    db_session.add(business)
    db_session.commit()
    db_session.refresh(business)
    return business


# Mock YouTube API response fixtures
@pytest.fixture
def youtube_comment_threads_page1():
    return {
        "kind": "youtube#commentThreadListResponse",
        "etag": "etag123",
        "nextPageToken": "token_page_2",
        "pageInfo": {"totalResults": 2, "resultsPerPage": 2},
        "items": [
            {
                "kind": "youtube#commentThread",
                "id": "thread_1",
                "snippet": {
                    "videoId": "vid123",
                    "topLevelComment": {
                        "kind": "youtube#comment",
                        "id": "comment_1",
                        "snippet": {
                            "authorDisplayName": "Alice Wonder",
                            "authorProfileImageUrl": "https://yt3.ggpht.com/alice.jpg",
                            "authorChannelUrl": "http://www.youtube.com/channel/UC_alice",
                            "authorChannelId": {"value": "UC_alice"},
                            "channelId": "UC_channel",
                            "videoId": "vid123",
                            "textDisplay": "Super helpful walkthrough, loved the explanation!",
                            "textOriginal": "Super helpful walkthrough, loved the explanation!",
                            "likeCount": 15,
                            "publishedAt": "2024-03-01T12:00:00Z",
                            "updatedAt": "2024-03-01T12:00:00Z",
                        },
                    },
                    "canReply": True,
                    "totalReplyCount": 1,
                    "isPublic": True,
                },
                "replies": {
                    "comments": [
                        {
                            "kind": "youtube#comment",
                            "id": "reply_1_1",
                            "snippet": {
                                "parentId": "comment_1",
                                "authorDisplayName": "Bob Builder",
                                "authorProfileImageUrl": "https://yt3.ggpht.com/bob.jpg",
                                "authorChannelUrl": "http://www.youtube.com/channel/UC_bob",
                                "authorChannelId": {"value": "UC_bob"},
                                "videoId": "vid123",
                                "textDisplay": "Same here, the demo was crystal clear.",
                                "textOriginal": "Same here, the demo was crystal clear.",
                                "likeCount": 3,
                                "publishedAt": "2024-03-01T13:00:00Z",
                                "updatedAt": "2024-03-01T13:00:00Z",
                            },
                        }
                    ]
                },
            },
            {
                "kind": "youtube#commentThread",
                "id": "thread_2",
                "snippet": {
                    "videoId": "vid123",
                    "topLevelComment": {
                        "kind": "youtube#comment",
                        "id": "comment_2",
                        "snippet": {
                            "authorDisplayName": "Charlie Brown",
                            "authorProfileImageUrl": "https://yt3.ggpht.com/charlie.jpg",
                            "authorChannelUrl": "http://www.youtube.com/channel/UC_charlie",
                            "authorChannelId": {"value": "UC_charlie"},
                            "channelId": "UC_channel",
                            "videoId": "vid123",
                            "textDisplay": "Can you make a follow-up on error handling?",
                            "textOriginal": "Can you make a follow-up on error handling?",
                            "likeCount": 8,
                            "publishedAt": "2024-03-02T09:30:00Z",
                            "updatedAt": "2024-03-02T09:30:00Z",
                        },
                    },
                    "canReply": True,
                    "totalReplyCount": 0,
                    "isPublic": True,
                },
            },
        ],
    }


@pytest.fixture
def youtube_comment_threads_page2():
    return {
        "kind": "youtube#commentThreadListResponse",
        "etag": "etag456",
        "nextPageToken": None,
        "pageInfo": {"totalResults": 1, "resultsPerPage": 1},
        "items": [
            {
                "kind": "youtube#commentThread",
                "id": "thread_3",
                "snippet": {
                    "videoId": "vid123",
                    "topLevelComment": {
                        "kind": "youtube#comment",
                        "id": "comment_3",
                        "snippet": {
                            "authorDisplayName": "Diana Prince",
                            "authorProfileImageUrl": "https://yt3.ggpht.com/diana.jpg",
                            "authorChannelUrl": "http://www.youtube.com/channel/UC_diana",
                            "authorChannelId": {"value": "UC_diana"},
                            "channelId": "UC_channel",
                            "videoId": "vid123",
                            "textDisplay": "Awesome content, subscribed!",
                            "textOriginal": "Awesome content, subscribed!",
                            "likeCount": 20,
                            "publishedAt": "2024-03-03T15:45:00Z",
                            "updatedAt": "2024-03-03T15:45:00Z",
                        },
                    },
                    "canReply": True,
                    "totalReplyCount": 0,
                    "isPublic": True,
                },
            }
        ],
    }


@pytest.fixture
def youtube_video_details_response():
    return {
        "kind": "youtube#videoListResponse",
        "items": [
            {
                "id": "vid123",
                "snippet": {
                    "publishedAt": "2024-02-28T10:00:00Z",
                    "channelId": "UC_channel123",
                    "title": "FastAPI & YouTube Data API Tutorial",
                    "channelTitle": "Tech Academy",
                },
            }
        ],
    }
