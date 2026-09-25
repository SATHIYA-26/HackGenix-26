import pytest
from app.nlp.preprocessing import TextPreprocessor


@pytest.fixture
def preprocessor():
    p = TextPreprocessor()
    p.reset_dedup_cache()
    return p


def test_text_validation(preprocessor):
    with pytest.raises(ValueError):
        preprocessor.validate_text("")

    with pytest.raises(ValueError):
        preprocessor.validate_text("   \n\t  ")

    assert preprocessor.validate_text(" Valid text ") == "Valid text"


def test_normalization_preserves_emojis_and_negations(preprocessor):
    raw = "The   app is NOT working   at all!! 😡  Refund my moneyyyy"
    cleaned = preprocessor.normalize(raw)

    assert "NOT working" in cleaned
    assert "😡" in cleaned
    assert "Refund my moneyy" in cleaned  # Character repetition collapsed
    assert "  " not in cleaned  # Double spaces collapsed


def test_spam_and_noise_detection(preprocessor):
    noise_samples = [
        "nice",
        "first",
        "ok",
        "k",
        "asdfghjk",
        "...",
        "???",
        "yo",
        "12345",
        "👍",
    ]
    for text in noise_samples:
        assert preprocessor.is_spam_or_noise(text) is True, f"Failed to flag '{text}' as noise"

    valid_samples = [
        "UPI payment failed on checkout",
        "Great customer support, resolved my issue quickly",
        "Delivery was delayed by 3 days",
    ]
    for text in valid_samples:
        assert preprocessor.is_spam_or_noise(text) is False, f"Incorrectly flagged '{text}' as noise"


def test_exact_and_near_deduplication(preprocessor):
    # First item
    is_dup1, orig1 = preprocessor.check_duplicate("f_1", "UPI payment failed on checkout screen")
    assert is_dup1 is False
    assert orig1 is None

    # Exact duplicate
    is_dup2, orig2 = preprocessor.check_duplicate("f_2", "UPI payment failed on checkout screen")
    assert is_dup2 is True
    assert orig2 == "f_1"

    # Near duplicate
    is_dup3, orig3 = preprocessor.check_duplicate("f_3", "Hey team, UPI payment failed on checkout screen!! Please fix")
    assert is_dup3 is True
    assert orig3 == "f_1"

    # Distinct feedback item
    is_dup4, orig4 = preprocessor.check_duplicate("f_4", "Delivery was delayed by four days courier was rude")
    assert is_dup4 is False
    assert orig4 is None
