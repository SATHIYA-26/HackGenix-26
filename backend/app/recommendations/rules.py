from typing import Dict, Any, List


class RecommendationRuleRegistry:
    """Catalog of evidence-backed recommendation templates by domain."""

    @staticmethod
    def get_recommendation_template(
        problem_name: str,
        dimensions: Dict[str, Any],
        metrics: Dict[str, Any],
    ) -> Dict[str, str]:
        """Produce structured (Observed, Inferred, Recommended) recommendation blocks."""
        name_lower = problem_name.lower()
        platform = dimensions.get("platform") or "All Platforms"
        version = dimensions.get("version") or "Latest Releases"
        feature = dimensions.get("feature") or "Core Flow"
        count = metrics.get("feedback_count", 0)
        neg_pct = metrics.get("negative_sentiment_pct", 0.0)
        growth_pct = metrics.get("growth_pct", 0.0)

        observed = (
            f"{count} related customer feedback items recorded with {neg_pct:.0%} negative sentiment. "
            f"Growth rate is currently {growth_pct:+.0%}. "
            f"Most affected platform: {platform.title()}; primary version: {version}; component: {feature}."
        )

        # 1. UPI Payment Failure
        if "upi" in name_lower or ("payment" in name_lower and "fail" in name_lower):
            inferred = (
                "Data patterns suggest a webhook timeout or asynchronous order-status reconciliation race "
                "between third-party UPI payment gateways and the order placement service."
            )
            recommended = (
                f"1. Audit the payment confirmation webhook and idempotency handling in the {platform.title()} checkout service.\n"
                f"2. Implement an automated reconciliation worker to resolve debited-but-pending transactions within 60 seconds.\n"
                f"3. Prioritize verification on {platform.title()} client v{version}."
            )
            reason = "Payment failures directly cause customer financial distress, failed orders, and high support ticket volume."

        # 2. Checkout Performance / Sluggishness
        elif "checkout" in name_lower or "performance" in name_lower or "latency" in name_lower:
            inferred = (
                "Complaints correlate with checkout page initialization, possibly caused by synchronous blocking API calls "
                "(coupon validation, inventory lock, address calculation) on the main UI thread."
            )
            recommended = (
                f"1. Profile client rendering and network waterfalls on the {platform.title()} checkout view.\n"
                f"2. Defer non-critical pricing queries and add skeleton loading states.\n"
                f"3. Benchmark checkout payload payload size on mobile devices."
            )
            reason = "High checkout latency directly increases cart abandonment rate."

        # 3. Authentication & OTP Failures
        elif any(w in name_lower for w in ["login", "otp", "auth", "sms"]):
            inferred = (
                "Feedback indicates SMS gateway delivery delays exceeding OTP expiry windows, "
                "or session token invalidation bugs after app updates."
            )
            recommended = (
                "1. Introduce WhatsApp / Email fallback OTP delivery when SMS fails after 30 seconds.\n"
                "2. Extend OTP validity buffer from 60s to 120s temporarily.\n"
                "3. Verify biometric/FaceID token persistence across app backgrounding."
            )
            reason = "Authentication blocks prevent customers from accessing their accounts and completing purchases."

        # 4. Delivery Issues
        elif any(w in name_lower for w in ["delivery", "rider", "courier"]):
            inferred = (
                "Customer reports point to courier tracking telemetry discrepancies and dispatch delays "
                "during peak fulfillment periods."
            )
            recommended = (
                "1. Audit third-party logistics GPS synchronization frequency.\n"
                "2. Implement proactive push alerts when delivery is delayed by > 2 hours.\n"
                "3. Streamline one-click damaged goods return requests inside the mobile app."
            )
            reason = "Post-purchase fulfillment delays directly harm repeat retention."

        # 5. UI / Contrast / Layout
        elif any(w in name_lower for w in ["ui", "dark mode", "font", "contrast"]):
            inferred = (
                "Visual contrast issues in dark theme CSS tokens and layout clipping on varied display resolutions."
            )
            recommended = (
                "1. Review WCAG 2.1 AA color contrast compliance across dark theme stylesheets.\n"
                "2. Fix overlapping layout elements in responsive viewport breakpoints."
            )
            reason = "Poor UI legibility creates user frustration and perception of low product quality."

        # Generic / Default
        else:
            inferred = (
                f"Feedback volume patterns suggest user friction in the {feature} area on {platform.title()}."
            )
            recommended = (
                f"1. Conduct targeted user telemetry analysis on {feature}.\n"
                f"2. Review recent code changes deployed in version {version}."
            )
            reason = "Addressing customer friction prevents negative app store ratings and improves satisfaction."

        return {
            "observed": observed,
            "inferred": inferred,
            "recommended": recommended,
            "reason": reason,
        }
