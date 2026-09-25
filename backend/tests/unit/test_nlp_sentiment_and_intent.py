import pytest
from app.nlp.sentiment import SentimentAnalysisService
from app.nlp.intent import IntentClassificationService
from app.schemas.analysis import SentimentEnum, IntentEnum


@pytest.fixture
def sentiment_service():
    return SentimentAnalysisService()


@pytest.fixture
def intent_service():
    return IntentClassificationService()


def test_sentiment_analysis_categories(sentiment_service):
    neg_res = sentiment_service.analyze_text("UPI payment failed and order was cancelled, money deducted!")
    assert neg_res.sentiment == SentimentEnum.NEGATIVE
    assert 0.0 <= neg_res.confidence <= 1.0

    pos_res = sentiment_service.analyze_text("Great application, loved the new clean UI update and fast checkout ❤️")
    assert pos_res.sentiment == SentimentEnum.POSITIVE
    assert 0.0 <= pos_res.confidence <= 1.0

    neu_res = sentiment_service.analyze_text("The app is okay, does the job.")
    assert neu_res.sentiment == SentimentEnum.NEUTRAL


def test_sentiment_batch_analysis(sentiment_service):
    texts = [
        "Terrible experience, app crashes constantly",
        "Amazing fast delivery and super friendly driver!",
        "Average experience.",
    ]
    results = sentiment_service.analyze_batch(texts)
    assert len(results) == 3
    assert results[0].sentiment == SentimentEnum.NEGATIVE
    assert results[1].sentiment == SentimentEnum.POSITIVE
    assert results[2].sentiment == SentimentEnum.NEUTRAL


def test_intent_classification_categories(intent_service):
    test_cases = [
        ("UPI transaction timed out but money left my bank account", IntentEnum.PAYMENT_ISSUE),
        ("Please fix login, OTP never arrives on SMS", IntentEnum.LOGIN_ISSUE),
        ("Checkout takes forever to load and screen freezes", IntentEnum.PERFORMANCE),
        ("App crashes as soon as I hit checkout button", IntentEnum.BUG),
        ("Please add Apple Pay support for international customers", IntentEnum.FEATURE_REQUEST),
        ("Delivery delayed by 4 days without any notification", IntentEnum.DELIVERY),
        ("Charged hidden service fees at final checkout screen", IntentEnum.PRICING),
        ("Dark mode has unreadable black text on dark background", IntentEnum.UI_UX),
    ]

    for text, expected_intent in test_cases:
        res = intent_service.classify_text(text)
        assert res.intent == expected_intent, f"Expected {expected_intent} for text: '{text}', got: {res.intent}"
        assert 0.0 <= res.confidence <= 1.0
