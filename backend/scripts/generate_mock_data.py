import json
import random
from datetime import datetime, timedelta, timezone
from pathlib import Path

def generate_mock_feedback_data(output_path: str = "data/mock_feedback.json", count: int = 530):
    random.seed(42)

    sources = [
        ("youtube", "https://youtube.com/watch?v=mock_{id}&lc=Ugz{hash}"),
        ("google_play", "https://play.google.com/store/apps/details?id=com.app.shop&reviewId=gp_{id}"),
        ("app_store", "https://apps.apple.com/app/id123456?reviewId=as_{id}"),
        ("support_ticket", "https://desk.company.com/agent/tickets/{id}"),
        ("survey", None),
        ("custom_api", None),
    ]

    now = datetime(2026, 9, 25, 12, 0, 0, tzinfo=timezone.utc)

    # Categories with weighted distributions & templates
    upi_templates = [
        "UPI payment failed again",
        "Payment through UPI isn't working on checkout",
        "Money got deducted from my bank account but my order was cancelled",
        "Why is UPI broken again? Every time I try Google Pay it times out",
        "The app freezes when I try to pay via UPI",
        "Paid via UPI, money debited, but order status is still pending after 2 hours",
        "UPI transaction timed out but my balance reduced. Order failed! Please refund",
        "UPI QR code doesn't load on the payment screen",
        "UPI payment gateway error 504 gateway timeout every single time",
        "I paid through UPI but my order was cancelled immediately",
        "UPI autopay mandate keeps getting rejected by the app",
        "PhonePe UPI option hangs indefinitely on Android checkout",
        "Google Pay UPI payment went through bank, but app shows transaction rejected",
        "Constant UPI failure on checkout screen. Terrible experience",
        "Why does UPI fail repeatedly on Android 14?",
    ]

    checkout_perf_templates = [
        "Checkout takes forever to load",
        "Cart page hangs when clicking Proceed to Pay",
        "The checkout button is completely unresponsive on iOS",
        "App crashes as soon as I hit checkout",
        "Loading spinner on checkout never stops spinning",
        "Checkout is so slow it took 5 minutes just to see the final bill",
        "Every time I go to checkout, the screen turns blank white",
        "Performance during payment processing is horribly sluggish",
        "The app locks up completely at the payment review stage",
    ]

    login_auth_templates = [
        "Please fix login, OTP never arrives on SMS",
        "Cannot login with Google account, throws internal server error",
        "OTP expired before it even reached my phone number",
        "Logged out automatically every 10 minutes, super annoying",
        "Password reset link sends 404 error page",
        "Face ID and biometric fingerprint login failed repeatedly",
        "Login screen is completely unresponsive after latest update",
        "Can't log into my account on iPad",
    ]

    delivery_templates = [
        "Delivery delayed by 4 days without any notification from the driver",
        "Delivery rider marked package delivered but I never received it!",
        "Live tracking map is stuck 10 km away and never updates",
        "Package arrived damaged and crushed, courier refused to take return",
        "Estimated delivery was 2 days, now it's been 2 weeks and no update",
        "Courier driver was extremely rude and dropped the package in rain",
    ]

    pricing_templates = [
        "Charged hidden service fees and packaging fees at final payment screen",
        "Monthly subscription auto-renewed despite cancellation last week",
        "Promo coupon code SAVE50 says applied successfully but discount is zero",
        "Price jumped by 20% between cart and payment screen",
        "Refund policy is very misleading, they only offer wallet credits",
    ]

    ui_ux_templates = [
        "Dark mode has unreadable black text on dark background",
        "Font size is tiny on tablet screen, impossible to read product details",
        "Search bar disappears when scrolling down category pages",
        "Filters button overlaps with navigation bar on mobile",
        "Back button closes the entire app instead of going back one page",
        "Too many intrusive popups asking for app review",
    ]

    feature_request_templates = [
        "Please add Apple Pay support for international customers",
        "Would love a dark theme option in the general settings",
        "Add ability to schedule delivery time slots in advance",
        "Can we have multi-item order tracking on one screen?",
        "Please add split payment between digital wallet and credit card",
        "Requesting biometric authentication lock for opening app",
        "Would be great to export invoice receipts as PDF directly",
    ]

    positive_templates = [
        "Great application, smooth and fast delivery! Love the service ❤️",
        "Loved the new clean UI update, kudos to the engineering team",
        "Customer support resolved my query in 5 minutes, fantastic service!",
        "Best shopping experience so far, highly recommended to everyone",
        "Super fast checkout and intuitive design. 5 stars!",
        "Everything arrived in perfect condition, great packaging",
        "Very reliable app, never faced any issues so far",
        "Smooth payment and instant confirmation. Kudos!",
    ]

    neutral_templates = [
        "The app is okay, nothing special compared to competitors",
        "Works fine most of the time, does the job",
        "Average experience, could use minor speed improvements",
        "Decent app, basic features work as expected",
    ]

    spam_noise_templates = [
        "nice",
        "first",
        "ok",
        "asdfghjk",
        "👍",
        "...",
        "check",
        "yo",
        "hi",
        "good",
        "cool",
        "12345",
        "testing test",
    ]

    multi_issue_templates = [
        "UPI payment failed and when I tried to log in again OTP didn't arrive either!",
        "App is super slow on checkout, plus hidden fees were added without warning.",
        "Delivery was late by 3 days and the courier refused to accept return for damaged box.",
        "Constant app crashes when opening cart, and UPI payment was deducted twice.",
    ]

    records = []

    # Distribution of records over 4 weeks:
    # Week 1: days 28-22 ago (approx 50 records, few UPI)
    # Week 2: days 21-15 ago (approx 80 records, moderate UPI)
    # Week 3: days 14-8 ago (approx 140 records, rising UPI)
    # Week 4: days 7-0 ago (approx 260 records, heavy UPI surge!)

    time_buckets = [
        {"min_days": 22, "max_days": 28, "count": 55, "upi_weight": 0.08},
        {"min_days": 15, "max_days": 21, "count": 85, "upi_weight": 0.15},
        {"min_days": 8, "max_days": 14, "count": 140, "upi_weight": 0.28},
        {"min_days": 0, "max_days": 7, "count": 250, "upi_weight": 0.46},
    ]

    record_idx = 1

    for bucket in time_buckets:
        for _ in range(bucket["count"]):
            # Choose category
            roll = random.random()
            if roll < bucket["upi_weight"]:
                category = "upi"
                text = random.choice(upi_templates)
                rating = random.choice([1.0, 1.0, 1.0, 2.0])
                feature = "checkout"
                platform = random.choice(["android", "android", "android", "ios"])
                version = random.choice(["4.2.1", "4.2.1", "4.2.0"])
            elif roll < bucket["upi_weight"] + 0.12:
                category = "checkout_perf"
                text = random.choice(checkout_perf_templates)
                rating = random.choice([1.0, 2.0, 2.0])
                feature = "checkout"
                platform = random.choice(["android", "ios", "web"])
                version = random.choice(["4.2.1", "4.2.0", "4.1.9"])
            elif roll < bucket["upi_weight"] + 0.22:
                category = "login_auth"
                text = random.choice(login_auth_templates)
                rating = random.choice([1.0, 1.0, 2.0])
                feature = "auth"
                platform = random.choice(["android", "ios", "web"])
                version = random.choice(["4.2.1", "4.2.0"])
            elif roll < bucket["upi_weight"] + 0.32:
                category = "delivery"
                text = random.choice(delivery_templates)
                rating = random.choice([1.0, 2.0])
                feature = "delivery"
                platform = random.choice(["android", "ios"])
                version = "4.2.0"
            elif roll < bucket["upi_weight"] + 0.40:
                category = "pricing"
                text = random.choice(pricing_templates)
                rating = random.choice([1.0, 2.0])
                feature = "billing"
                platform = random.choice(["android", "web"])
                version = "4.2.1"
            elif roll < bucket["upi_weight"] + 0.48:
                category = "ui_ux"
                text = random.choice(ui_ux_templates)
                rating = random.choice([2.0, 3.0])
                feature = "ui"
                platform = random.choice(["android", "ios"])
                version = "4.2.1"
            elif roll < bucket["upi_weight"] + 0.58:
                category = "feature_request"
                text = random.choice(feature_request_templates)
                rating = random.choice([3.0, 4.0, 5.0, None])
                feature = "general"
                platform = random.choice(["ios", "android"])
                version = "4.2.1"
            elif roll < bucket["upi_weight"] + 0.72:
                category = "positive"
                text = random.choice(positive_templates)
                rating = random.choice([4.0, 5.0, 5.0])
                feature = "general"
                platform = random.choice(["android", "ios", "web"])
                version = "4.2.1"
            elif roll < bucket["upi_weight"] + 0.80:
                category = "neutral"
                text = random.choice(neutral_templates)
                rating = random.choice([3.0, 3.0, 4.0])
                feature = "general"
                platform = random.choice(["android", "ios"])
                version = "4.2.0"
            elif roll < bucket["upi_weight"] + 0.90:
                category = "spam"
                text = random.choice(spam_noise_templates)
                rating = random.choice([None, 1.0, 3.0, 5.0])
                feature = None
                platform = random.choice(["android", "ios"])
                version = None
            else:
                category = "multi_issue"
                text = random.choice(multi_issue_templates)
                rating = 1.0
                feature = "checkout"
                platform = "android"
                version = "4.2.1"

            # Create random variation / near duplicates
            if random.random() < 0.15 and category != "spam":
                variations = [
                    f"{text}!! Please fix asap.",
                    f"Hey team, {text.lower()}",
                    f"{text} (happened on my phone today)",
                    f"{text} 😡",
                    text, # exact duplicate
                ]
                text = random.choice(variations)

            # Random timestamp in the bucket
            days_ago = random.uniform(bucket["min_days"], bucket["max_days"])
            seconds_ago = days_ago * 86400
            created_at = (now - timedelta(seconds=seconds_ago)).isoformat()

            # Choose source
            src_name, src_url_tpl = random.choice(sources)
            src_url = src_url_tpl.format(id=record_idx, hash=random.randint(1000, 9999)) if src_url_tpl else None

            metadata = {
                "product": "mobile_app" if platform in ("android", "ios") else "web_portal",
                "platform": platform,
            }
            if version:
                metadata["version"] = version
            if feature:
                metadata["feature"] = feature

            records.append({
                "feedback_id": f"{src_name[:2]}_{record_idx:04d}",
                "source": src_name,
                "source_url": src_url,
                "text": text,
                "rating": rating,
                "created_at": created_at,
                "metadata": metadata,
            })
            record_idx += 1

    # Ensure output directory exists
    out_file = Path(output_path)
    out_file.parent.mkdir(parents=True, exist_ok=True)
    with open(out_file, "w", encoding="utf-8") as f:
        json.dump(records, f, indent=2, ensure_ascii=False)

    print(f"Generated {len(records)} mock feedback records successfully at: {out_file.resolve()}")
    return records


if __name__ == "__main__":
    generate_mock_feedback_data("backend/data/mock_feedback.json", 530)
