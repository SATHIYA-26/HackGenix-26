#!/usr/bin/env python3
"""
Seed Multi-Account Intelligence Data
=====================================
Seeds authentic, domain-tailored feedback, NLP analyses, embeddings,
problem clusters, priority breakdowns, trends, recommendations, insights,
and closed-loop actions for:
  1. acc_manis    - Mani's Dum Biriyani (Restaurant / Dining)
  2. acc_chepauk  - Chepauk Sports Store (Sports Retail Showroom)
  3. acc_spotify  - Spotify Android (Mobile Music Streaming)
  4. acc_vj_sidhu - VJ Sidhu Vlogs (Starts clean/empty for live YouTube extraction)
"""

import sys
import uuid
from datetime import datetime, timedelta, timezone
from pathlib import Path

# Ensure backend root is on sys.path
backend_dir = Path(__file__).resolve().parent.parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

from app.db.database import SessionLocal, init_db
from app.db.models import (
    Feedback,
    FeedbackAnalysis,
    FeedbackEmbedding,
    ProblemCluster,
    problem_feedback,
    Trend,
    Recommendation,
    Insight,
    Action,
)
from sqlalchemy import text


def seed_all_accounts():
    print("=" * 80)
    print(" [*] SEEDING MULTI-ACCOUNT FEEDBACK INTELLIGENCE PLATFORM")
    print("=" * 80)

    init_db()
    db = SessionLocal()

    try:
        # Purge existing records for the 3 accounts so re-seeding is clean and idempotent
        print("[1/5] Cleaning existing records for seed accounts...")
        account_ids = ["acc_manis", "acc_chepauk", "acc_spotify"]
        
        # Delete actions, insights, recommendations, trends, problem_feedback, problem_clusters, feedback
        db.query(Action).filter(Action.account_id.in_(account_ids)).delete(synchronize_session=False)
        
        # Find problem clusters to delete
        cluster_ids = [p.id for p in db.query(ProblemCluster).filter(ProblemCluster.account_id.in_(account_ids)).all()]
        if cluster_ids:
            db.query(Insight).filter(Insight.problem_id.in_(cluster_ids)).delete(synchronize_session=False)
            db.query(Recommendation).filter(Recommendation.problem_id.in_(cluster_ids)).delete(synchronize_session=False)
            db.query(Trend).filter(Trend.problem_id.in_(cluster_ids)).delete(synchronize_session=False)
            db.execute(text("DELETE FROM problem_feedback WHERE problem_id IN :ids"), {"ids": tuple(cluster_ids)})
            db.query(ProblemCluster).filter(ProblemCluster.id.in_(cluster_ids)).delete(synchronize_session=False)

        # Delete feedback
        fb_ids = [f.feedback_id for f in db.query(Feedback).filter(Feedback.account_id.in_(account_ids)).all()]
        if fb_ids:
            db.query(FeedbackAnalysis).filter(FeedbackAnalysis.feedback_id.in_(fb_ids)).delete(synchronize_session=False)
            db.query(FeedbackEmbedding).filter(FeedbackEmbedding.feedback_id.in_(fb_ids)).delete(synchronize_session=False)
            db.query(Feedback).filter(Feedback.feedback_id.in_(fb_ids)).delete(synchronize_session=False)

        db.commit()
        print("      Existing account records cleaned.")

        now = datetime.now(timezone.utc)

        # =========================================================================
        # ACCOUNT 1: MANI'S DUM BIRIYANI (acc_manis)
        # =========================================================================
        print("\n[2/5] Seeding Account 1: Mani's Dum Biriyani (acc_manis)...")
        manis_feedback_data = [
            # Sunday wait bottleneck
            ("fb_mb_01", "google_maps", "https://maps.google.com/?cid=manis_annanagar", "Waited 45 mins with my elderly parents in the hot sun outside Anna Nagar branch. Seating queue was chaotic with no chairs or token system!", 1.0, "negative", 0.98, "complaint", "wait times in anna nagar branch are unbearable on sunday lunch", now - timedelta(days=2)),
            ("fb_mb_02", "google_maps", "https://maps.google.com/?cid=manis_annanagar", "Food is outstanding but Sunday lunch rush at Anna Nagar branch was a nightmare. 50 minute wait time without shade.", 2.0, "negative", 0.94, "complaint", "need token queue system for weekend rush", now - timedelta(days=3)),
            ("fb_mb_03", "in_store_pos", None, "Token waiting system needed immediately. Customers leaving due to standing for over 40 minutes.", 2.0, "negative", 0.92, "feedback", "long wait time outside showroom", now - timedelta(days=1)),
            ("fb_mb_04", "google_maps", "https://maps.google.com/?cid=manis_annanagar", "Line extends to main road on Sundays. Need digital SMS pager so we can wait in air-conditioned car.", 2.0, "negative", 0.91, "feature_request", "add sms pager queue tracking", now - timedelta(days=4)),
            
            # Delivery packaging leak
            ("fb_mb_05", "swiggy", "https://swiggy.com/orders/mb_101", "Biriyani arrived on time but the brinjal gravy container foil lid popped open! Entire plastic bag was full of curry spillage.", 1.0, "negative", 0.96, "bug", "gravy container foil leaked inside swiggy bag", now - timedelta(days=2)),
            ("fb_mb_06", "zomato", "https://zomato.com/orders/mb_102", "Raita and gravy leaked into the paper bag during two-wheeler delivery. Packaging must use tighter heat-sealed bowls.", 2.0, "negative", 0.93, "complaint", "delivery container foil seal failure", now - timedelta(days=3)),
            ("fb_mb_07", "swiggy", "https://swiggy.com/orders/mb_103", "Leaking curry ruined the unboxing experience. Please transition to heat-induction polypropylene bowls.", 2.0, "negative", 0.89, "feedback", "gravy leaking during transit", now - timedelta(days=5)),

            # Marination variance
            ("fb_mb_08", "google_maps", "https://maps.google.com/?cid=manis_tnagar", "Mutton pieces on Tuesday were a bit tough compared to the weekend batch. Need consistency from central kitchen.", 3.0, "neutral", 0.82, "complaint", "mutton piece tenderness variance between batches", now - timedelta(days=7)),
            ("fb_mb_09", "google_maps", "https://maps.google.com/?cid=manis_velachery", "Weekday mutton biriyani meat was slightly chewy. Weekend pots are always 10/10 melt-in-mouth.", 3.0, "neutral", 0.79, "complaint", "marination consistency on weekdays", now - timedelta(days=8)),

            # Sweet beeda stockout
            ("fb_mb_10", "google_maps", "https://maps.google.com/?cid=manis_velachery", "Delicious meal as always, but by 2:30 PM the complimentary sweet beeda was completely out of stock!", 3.0, "negative", 0.85, "complaint", "sweet beeda runs out too early in afternoon", now - timedelta(days=1)),
            ("fb_mb_11", "google_maps", "https://maps.google.com/?cid=manis_tnagar", "Disappointed that sweet beeda was finished by 2:15 PM on Sunday. It's the hallmark conclusion to Mani's biriyani.", 3.0, "negative", 0.87, "complaint", "complimentary beeda stock exhausted early", now - timedelta(days=2)),

            # Praise & positive feedback
            ("fb_mb_12", "google_maps", "https://maps.google.com/?cid=manis_tnagar", "The Mutton Dum Biriyani here is undefeated in Chennai! Rice is perfectly separated, meat slides off bone.", 5.0, "positive", 0.99, "praise", "best mutton dum biriyani in chennai", now - timedelta(days=1)),
            ("fb_mb_13", "google_maps", "https://maps.google.com/?cid=manis_velachery", "Velachery branch service is lightning fast and chicken 65 is crispy. Brinjal gravy is rich and aromatic.", 5.0, "positive", 0.98, "praise", "excellent food and quick service", now - timedelta(days=3)),
            ("fb_mb_14", "swiggy", "https://swiggy.com/orders/mb_104", "Generous portion size and arrived piping hot! Best biriyani in town.", 5.0, "positive", 0.97, "praise", "great delivery portion and hot food", now - timedelta(days=4)),
        ]

        manis_fb_objs = []
        for fid, src, surl, txt, rat, sent, conf, intent, cl_txt, c_dt in manis_feedback_data:
            fb = Feedback(
                feedback_id=fid,
                source=src,
                source_url=surl,
                text=txt,
                rating=rat,
                account_id="acc_manis",
                created_at=c_dt,
                extra_metadata={"branch": "Chennai", "account_id": "acc_manis"},
            )
            db.add(fb)
            manis_fb_objs.append(fb)

            fa = FeedbackAnalysis(
                feedback_id=fid,
                sentiment=sent,
                sentiment_confidence=conf,
                intent=intent,
                intent_confidence=0.91,
                cleaned_text=cl_txt,
                language="en",
                is_noise=False,
                is_duplicate=False,
            )
            db.add(fa)

            # Dummy 768-D embedding
            emb = FeedbackEmbedding(
                feedback_id=fid,
                embedding=[0.05] * 768,
                model_name="BAAI/bge-base-en-v1.5",
            )
            db.add(emb)

        db.commit()

        # Problem 1: Anna Nagar Sunday Wait Bottleneck
        prob_m1 = ProblemCluster(
            name="Sunday Peak Seating Wait Bottleneck in Anna Nagar",
            description="Family diners report 35-50 minute waiting times outside Anna Nagar branch during Sunday lunch rush due to manual paper queue management and lack of shaded seating.",
            feedback_count=142,
            average_sentiment=-0.84,
            growth_rate=1.25,
            severity=0.88,
            user_impact=0.89,
            priority_score=0.91,
            frequency_score=0.92,
            severity_score=0.88,
            growth_score=0.95,
            user_impact_score=0.89,
            negative_sentiment_score=0.84,
            product_dimension={
                "account_id": "acc_manis",
                "branch": "Anna Nagar",
                "area": "Dine-in Experience",
                "day": "Sunday Peak",
            },
            account_id="acc_manis",
        )
        db.add(prob_m1)
        db.flush()

        # Link feedback
        for fid in ["fb_mb_01", "fb_mb_02", "fb_mb_03", "fb_mb_04"]:
            db.execute(problem_feedback.insert().values(problem_id=prob_m1.id, feedback_id=fid, relevance_score=0.95))

        # Problem 2: Swiggy/Zomato Gravy Container Foil Leakage
        prob_m2 = ProblemCluster(
            name="Swiggy & Zomato Delivery Gravy Container Foil Leakage",
            description="Gravy and raita lids popping open during two-wheeler transit across Swiggy and Zomato orders, spilling curry inside the delivery bag.",
            feedback_count=84,
            average_sentiment=-0.78,
            growth_rate=0.35,
            severity=0.82,
            user_impact=0.83,
            priority_score=0.81,
            frequency_score=0.81,
            severity_score=0.82,
            growth_score=0.79,
            user_impact_score=0.83,
            negative_sentiment_score=0.78,
            product_dimension={
                "account_id": "acc_manis",
                "branch": "All Branches",
                "area": "Cloud Delivery",
                "channel": "Swiggy / Zomato",
            },
            account_id="acc_manis",
        )
        db.add(prob_m2)
        db.flush()

        for fid in ["fb_mb_05", "fb_mb_06", "fb_mb_07"]:
            db.execute(problem_feedback.insert().values(problem_id=prob_m2.id, feedback_id=fid, relevance_score=0.92))

        # Problem 3: Mutton Dum Tenderness Variance
        prob_m3 = ProblemCluster(
            name="Mutton Dum Biriyani Meat Tenderness & Marination Variance",
            description="Occasional reports of firmer mutton texture on weekday batches compared to weekend dum batches from central kitchen.",
            feedback_count=62,
            average_sentiment=-0.42,
            growth_rate=-0.18,
            severity=0.72,
            user_impact=0.74,
            priority_score=0.68,
            frequency_score=0.65,
            severity_score=0.72,
            growth_score=0.61,
            user_impact_score=0.74,
            negative_sentiment_score=0.42,
            product_dimension={
                "account_id": "acc_manis",
                "branch": "Central Kitchen",
                "area": "Kitchen Consistency",
            },
            account_id="acc_manis",
        )
        db.add(prob_m3)
        db.flush()

        # Problem 4: Sweet Beeda Stockout
        prob_m4 = ProblemCluster(
            name="Complimentary Sweet Beeda Stockout by 2:30 PM",
            description="Diners report that the complimentary digestive sweet beeda runs out midway through Sunday lunch rush.",
            feedback_count=38,
            average_sentiment=-0.65,
            growth_rate=0.40,
            severity=0.62,
            user_impact=0.64,
            priority_score=0.64,
            frequency_score=0.60,
            severity_score=0.62,
            growth_score=0.70,
            user_impact_score=0.64,
            negative_sentiment_score=0.65,
            product_dimension={
                "account_id": "acc_manis",
                "branch": "Velachery & T. Nagar",
                "area": "Customer Delight",
            },
            account_id="acc_manis",
        )
        db.add(prob_m4)
        db.flush()

        # Trends
        db.add(Trend(problem_id=prob_m1.id, time_window="7d", current_count=93, previous_count=41, growth_rate=1.25, is_emerging=True))
        db.add(Trend(problem_id=prob_m2.id, time_window="7d", current_count=48, previous_count=35, growth_rate=0.35, is_emerging=True))
        db.add(Trend(problem_id=prob_m3.id, time_window="7d", current_count=28, previous_count=34, growth_rate=-0.18, is_emerging=False))
        db.add(Trend(problem_id=prob_m4.id, time_window="7d", current_count=21, previous_count=15, growth_rate=0.40, is_emerging=True))

        # Recommendations
        rec_m1 = Recommendation(
            problem_id=prob_m1.id,
            recommendation="Scale Digital SMS Token Queue & Outdoor Shaded Awning to Anna Nagar Branch",
            reason="Pilot at T. Nagar branch proved that transparent SMS queue position alerts deflected 66.7% of wait-time complaints and improved net sentiment by 38 points.",
            evidence={
                "observed": "142 Google Maps complaints citing >45 min wait on Sunday lunch",
                "inferred": "Diners abandon or leave 1-star reviews when waiting outside unshaded in heat",
                "recommended": "Deploy QR registration tablet at doorway + WhatsApp readiness alerts",
                "confidence": 0.94,
            },
            confidence=0.94,
        )
        db.add(rec_m1)
        db.flush()

        rec_m2 = Recommendation(
            problem_id=prob_m2.id,
            recommendation="Transition to 750ml Heat-Sealed Leak-Proof Polypropylene Bowls for Gravy",
            reason="Heat-induction aluminum foil sealing eliminates side-spillage during two-wheeler transit on uneven roads.",
            evidence={
                "observed": "84 delivery reviews reporting curry leaking into delivery bag",
                "inferred": "Plastic snap lids dislodge under thermal pressure from hot gravy",
                "recommended": "Procure heat-induction sealing machines for central packaging line",
                "confidence": 0.91,
            },
            confidence=0.91,
        )
        db.add(rec_m2)

        # Insights
        ins_m1 = Insight(
            problem_id=prob_m1.id,
            summary="Anna Nagar branch Sunday lunch queue is currently the single largest driver of negative Google Maps reviews across all 4 branches.",
            why_it_matters="Family diners spending ₹1,800+ on average are becoming dissatisfied before tasting the food due to 45-minute sidewalk wait times.",
            evidence={
                "sample_feedback_ids": ["fb_mb_01", "fb_mb_02", "fb_mb_03", "fb_mb_04"],
                "total_complaints": 142,
                "negative_sentiment_pct": 84,
            },
            recommended_actions=[
                "Install QR token kiosk at Anna Nagar restaurant entrance",
                "Integrate automated SMS/WhatsApp alerts at 10-minute and 2-minute table readiness marks",
                "Set up 12 cushioned outdoor waiting chairs under retractable awning",
            ],
            suggested_response="Dear customer, thank you for visiting Mani's Dum Biriyani. We deeply apologize for the Sunday waiting time. We are currently rolling out an automated live SMS queue system and shaded outdoor seating to ensure your family waits in comfort.",
        )
        db.add(ins_m1)

        # Closed-loop Action
        act_m1 = Action(
            action_id="act_manis_01",
            problem_id=prob_m1.id,
            recommendation_id=rec_m1.id,
            account_id="acc_manis",
            title="SMS Token Pager & Live Queue Tracking for Weekend Dining",
            description="Deploy QR tablet queue check-in with automated Twilio SMS table readiness notifications and awning installation at Anna Nagar branch.",
            action_type="ux_improvement",
            status="released",
            assignee="Mani (Founder & Operations)",
            jira_issue_key="OPS-204",
            release_version="Anna Nagar v2.1",
            release_date=now - timedelta(days=5),
            baseline_metrics={
                "feedback_count": 93,
                "negative_ratio": 0.84,
                "priority_score": 0.91,
            },
            post_release_metrics={
                "feedback_count": 31,
                "negative_ratio": 0.28,
                "priority_score": 0.44,
            },
            impact_score=0.82,
            impact_summary="Queue friction complaints dropped 66.7% in the 5 days following SMS pager deployment; net diner sentiment surged +38 points.",
        )
        db.add(act_m1)
        db.commit()
        print(f"      Seeded {len(manis_feedback_data)} feedback items, 4 problems, 4 trends, 2 recommendations, 1 action for Mani's Dum Biriyani.")

        # =========================================================================
        # ACCOUNT 2: CHEPAUK SPORTS STORE (acc_chepauk)
        # =========================================================================
        print("\n[3/5] Seeding Account 2: Chepauk Sports Store (acc_chepauk)...")
        chepauk_feedback_data = [
            # Parking congestion
            ("fb_cs_01", "google_maps", "https://maps.google.com/?cid=chepauk_main", "Best cricket equipment store in Chennai, but parking on Bell's road on Saturday afternoon was impossible. Circled 4 times and ended up parking 1km away.", 3.0, "negative", 0.92, "complaint", "terrible parking situation on bells road on weekends", now - timedelta(days=1)),
            ("fb_cs_02", "google_maps", "https://maps.google.com/?cid=chepauk_main", "Traffic police towing vehicles near showroom during match days. Chepauk store needs designated customer parking.", 2.0, "negative", 0.95, "complaint", "parking congestion and vehicle towing outside store", now - timedelta(days=2)),
            ("fb_cs_03", "in_store_pos", None, "Took 30 mins just to find parking. Please arrange valet or tie up with nearby metro station.", 2.0, "negative", 0.88, "feedback", "need customer parking assistance", now - timedelta(days=3)),

            # Shoe sizes stockouts
            ("fb_cs_04", "google_maps", "https://maps.google.com/?cid=chepauk_main", "Came to buy Asics Gel-Peake cricket spikes in size UK 10, but completely out of stock. Staff said size 9 and 10 sell out every Saturday morning.", 2.0, "negative", 0.94, "complaint", "cricket spike shoe sizes 9 and 10 frequently out of stock", now - timedelta(days=2)),
            ("fb_cs_05", "in_store_pos", None, "No SG Savage spikes in size 9. Please order higher inventory buffers for popular shoe sizes.", 2.0, "negative", 0.91, "complaint", "stockout of size 9 spike shoes", now - timedelta(days=4)),

            # Bat knocking turnaround
            ("fb_cs_06", "google_maps", "https://maps.google.com/?cid=chepauk_main", "Machine bat knocking service is top class, but turnaround took 4 days instead of promised 24 hours due to peak league season rush.", 3.0, "neutral", 0.78, "complaint", "bat machine knocking turnaround stretched to 4 days", now - timedelta(days=6)),

            # Praise
            ("fb_cs_07", "google_maps", "https://maps.google.com/?cid=chepauk_main", "Got my SS Ton English Willow knocked and oiled here. Ping on the sweet spot is unreal! Murali sir personally helped me select bat weight.", 5.0, "positive", 0.99, "praise", "masterful bat knocking and personalized gear advice", now - timedelta(days=1)),
            ("fb_cs_08", "google_maps", "https://maps.google.com/?cid=chepauk_annasalai", "Genuine Kookaburra balls and extensive range of batting gloves. Best prices in South India.", 5.0, "positive", 0.98, "praise", "top quality cricket gear at genuine rates", now - timedelta(days=3)),
        ]

        for fid, src, surl, txt, rat, sent, conf, intent, cl_txt, c_dt in chepauk_feedback_data:
            fb = Feedback(
                feedback_id=fid,
                source=src,
                source_url=surl,
                text=txt,
                rating=rat,
                account_id="acc_chepauk",
                created_at=c_dt,
                extra_metadata={"showroom": "Chepauk Bell's Road", "account_id": "acc_chepauk"},
            )
            db.add(fb)

            fa = FeedbackAnalysis(
                feedback_id=fid,
                sentiment=sent,
                sentiment_confidence=conf,
                intent=intent,
                intent_confidence=0.92,
                cleaned_text=cl_txt,
                language="en",
                is_noise=False,
                is_duplicate=False,
            )
            db.add(fa)

            emb = FeedbackEmbedding(
                feedback_id=fid,
                embedding=[0.06] * 768,
                model_name="BAAI/bge-base-en-v1.5",
            )
            db.add(emb)

        db.commit()

        # Problem 1: Parking congestion
        prob_c1 = ProblemCluster(
            name="Bell's Road Vehicle Parking Congestion on Match Weekends",
            description="Shoppers struggle to find car or bike parking along Bell's Road during TNCA match weekends, leading to trip abandonment.",
            feedback_count=48,
            average_sentiment=-0.78,
            growth_rate=0.55,
            severity=0.84,
            user_impact=0.82,
            priority_score=0.82,
            frequency_score=0.79,
            severity_score=0.84,
            growth_score=0.83,
            user_impact_score=0.82,
            negative_sentiment_score=0.78,
            product_dimension={
                "account_id": "acc_chepauk",
                "location": "Chepauk Showroom",
                "area": "Store Accessibility",
            },
            account_id="acc_chepauk",
        )
        db.add(prob_c1)
        db.flush()

        for fid in ["fb_cs_01", "fb_cs_02", "fb_cs_03"]:
            db.execute(problem_feedback.insert().values(problem_id=prob_c1.id, feedback_id=fid, relevance_score=0.94))

        # Problem 2: Spike Shoes Stockout
        prob_c2 = ProblemCluster(
            name="Sizes 9 & 10 Cricket Spike Shoes Weekend Stockouts",
            description="High-demand sizes for Asics and SG cricket spikes run out of stock by Saturday noon, causing missed sales.",
            feedback_count=34,
            average_sentiment=-0.82,
            growth_rate=0.62,
            severity=0.80,
            user_impact=0.77,
            priority_score=0.79,
            frequency_score=0.75,
            severity_score=0.80,
            growth_score=0.85,
            user_impact_score=0.77,
            negative_sentiment_score=0.82,
            product_dimension={
                "account_id": "acc_chepauk",
                "category": "Footwear",
                "area": "Inventory Management",
            },
            account_id="acc_chepauk",
        )
        db.add(prob_c2)
        db.flush()

        # Problem 3: Machine Knocking Turnaround
        prob_c3 = ProblemCluster(
            name="English Willow Bat Machine Knocking Turnaround Time",
            description="Knocking turnaround stretched from 24h to 72h due to heavy pre-season cricket bat volume.",
            feedback_count=22,
            average_sentiment=-0.35,
            growth_rate=-0.15,
            severity=0.65,
            user_impact=0.61,
            priority_score=0.61,
            frequency_score=0.58,
            severity_score=0.65,
            growth_score=0.60,
            user_impact_score=0.61,
            negative_sentiment_score=0.35,
            product_dimension={
                "account_id": "acc_chepauk",
                "workshop": "Bat Customization Lab",
                "area": "Service Turnaround",
            },
            account_id="acc_chepauk",
        )
        db.add(prob_c3)
        db.flush()

        # Trends
        db.add(Trend(problem_id=prob_c1.id, time_window="7d", current_count=32, previous_count=21, growth_rate=0.55, is_emerging=True))
        db.add(Trend(problem_id=prob_c2.id, time_window="7d", current_count=22, previous_count=14, growth_rate=0.62, is_emerging=True))
        db.add(Trend(problem_id=prob_c3.id, time_window="7d", current_count=11, previous_count=13, growth_rate=-0.15, is_emerging=False))

        # Recommendations
        rec_c1 = Recommendation(
            problem_id=prob_c1.id,
            recommendation="Partner with Government Estate Metro Station Parking & Offer ₹100 Store Voucher",
            reason="Government Estate Metro Station is 300m away with 400+ sheltered parking bays; subsidizing Metro parking removes parking anxiety.",
            evidence={
                "observed": "48 reviews citing severe Bell's Road parking friction on match days",
                "inferred": "Customers abandon showroom visits due to fear of vehicle towing",
                "recommended": "Promote Metro transit directions on Instagram and provide ₹100 bill credit against valid parking token",
                "confidence": 0.91,
            },
            confidence=0.91,
        )
        db.add(rec_c1)
        db.flush()

        # Insights
        ins_c1 = Insight(
            problem_id=prob_c1.id,
            summary="Bell's Road weekend parking congestion is the primary operational friction preventing car-owning cricket players from visiting showroom.",
            why_it_matters="Average transaction size for weekend cricket kits is ₹8,500; lost footfall represents substantial missed showroom revenue.",
            evidence={
                "sample_feedback_ids": ["fb_cs_01", "fb_cs_02", "fb_cs_03"],
                "total_complaints": 48,
                "negative_sentiment_pct": 78,
            },
            recommended_actions=[
                "Deploy Metro Transit Guide on Google Business Profile",
                "Provide ₹100 store credit with Metro parking slip",
                "Arrange dedicated two-wheeler drop bay in front of showroom",
            ],
            suggested_response="Dear cricketer, thank you for shopping at Chepauk Sports Store! We understand Bell's road parking is congested during match season. We recommend using the spacious Government Estate Metro parking (300m away); bring your parking token to claim ₹100 off your purchase!",
        )
        db.add(ins_c1)

        # Action
        act_c1 = Action(
            action_id="act_chepauk_01",
            problem_id=prob_c1.id,
            recommendation_id=rec_c1.id,
            account_id="acc_chepauk",
            title="Metro Transit Parking Guide & Weekend Store Directions",
            description="Signage and social campaign directing shoppers to Government Estate Metro parking with ₹100 POS coupon discount.",
            action_type="ux_improvement",
            status="in_progress",
            assignee="Murali (Store General Manager)",
            jira_issue_key="OPS-102",
            release_version="v1.0-Ops",
            baseline_metrics={"feedback_count": 32, "negative_ratio": 0.78, "priority_score": 0.82},
        )
        db.add(act_c1)
        db.commit()
        print(f"      Seeded {len(chepauk_feedback_data)} feedback items, 3 problems, 3 trends, 1 recommendation, 1 action for Chepauk Sports Store.")

        # =========================================================================
        # ACCOUNT 3: SPOTIFY ANDROID (acc_spotify)
        # =========================================================================
        print("\n[4/5] Seeding Account 3: Spotify Android (acc_spotify)...")
        spotify_feedback_data = [
            # Offline crash
            ("fb_sp_01", "google_play", "https://play.google.com/store/apps/details?id=com.spotify.music&reviewId=1", "I pay for Premium specifically for flights, but since v8.9.70 update my 400 downloaded tracks fail to play in airplane mode! App says 'no internet connection'. Fix this emergency bug!", 1.0, "negative", 0.99, "bug", "offline downloaded music crashes in airplane mode on v8.9.70", now - timedelta(days=1)),
            ("fb_sp_02", "google_play", "https://play.google.com/store/apps/details?id=com.spotify.music&reviewId=2", "Offline mode is completely broken in v8.9.70. As soon as I turn off WiFi on the train, downloaded playlist freezes.", 1.0, "negative", 0.97, "bug", "offline playlist freezes without wifi connection", now - timedelta(days=2)),
            ("fb_sp_03", "reddit", "https://reddit.com/r/spotify/comments/offline_airplane_bug", "Anyone else having downloaded songs refuse to load on airplane mode after the latest Android update? DRM validation seems stuck.", 2.0, "negative", 0.95, "bug", "drm validation blocking offline playback", now - timedelta(days=2)),

            # Bluetooth desync
            ("fb_sp_04", "google_play", "https://play.google.com/store/apps/details?id=com.spotify.music&reviewId=3", "Bluetooth headphones auto-pause every time my Pixel 8 screen turns off on Android 14. Have to keep phone screen awake to listen.", 2.0, "negative", 0.93, "bug", "bluetooth audio pauses when screen locks on android 14", now - timedelta(days=3)),
            ("fb_sp_05", "google_play", "https://play.google.com/store/apps/details?id=com.spotify.music&reviewId=4", "Audio cuts out on Sony WH-1000XM5 when device goes to lock screen. Galaxy S24 Android 14 compatibility issue.", 2.0, "negative", 0.91, "bug", "bluetooth headset disconnect on lockscreen", now - timedelta(days=4)),

            # Lyrics synchronization
            ("fb_sp_06", "google_play", "https://play.google.com/store/apps/details?id=com.spotify.music&reviewId=5", "Live lyrics are lagging 3-4 seconds behind the vocal audio on slower 4G connections. Lyrics sync algorithm needs local caching.", 3.0, "neutral", 0.82, "complaint", "real time lyrics lagging behind vocal audio stream", now - timedelta(days=5)),

            # Praise
            ("fb_sp_07", "google_play", "https://play.google.com/store/apps/details?id=com.spotify.music&reviewId=6", "Discover Weekly algorithm is magical this month! Found so many indie artists. UI is silky smooth on 120Hz display.", 5.0, "positive", 0.99, "praise", "discover weekly recommendations and fluid 120hz ui", now - timedelta(days=2)),
            ("fb_sp_08", "google_play", "https://play.google.com/store/apps/details?id=com.spotify.music&reviewId=7", "Spotify Connect transitions seamlessly between my Google Home and phone. Love the audio quality.", 5.0, "positive", 0.98, "praise", "seamless device switching with spotify connect", now - timedelta(days=4)),
        ]

        for fid, src, surl, txt, rat, sent, conf, intent, cl_txt, c_dt in spotify_feedback_data:
            fb = Feedback(
                feedback_id=fid,
                source=src,
                source_url=surl,
                text=txt,
                rating=rat,
                account_id="acc_spotify",
                created_at=c_dt,
                extra_metadata={"version": "v8.9.70", "platform": "Android", "account_id": "acc_spotify"},
            )
            db.add(fb)

            fa = FeedbackAnalysis(
                feedback_id=fid,
                sentiment=sent,
                sentiment_confidence=conf,
                intent=intent,
                intent_confidence=0.94,
                cleaned_text=cl_txt,
                language="en",
                is_noise=False,
                is_duplicate=False,
            )
            db.add(fa)

            emb = FeedbackEmbedding(
                feedback_id=fid,
                embedding=[0.07] * 768,
                model_name="BAAI/bge-base-en-v1.5",
            )
            db.add(emb)

        db.commit()

        # Problem 1: Offline crash
        prob_s1 = ProblemCluster(
            name="Offline Music Downloads Crash in Airplane Mode (v8.9.70)",
            description="Premium users report that verified offline downloaded music tracks fail to initiate playback when airplane mode is engaged on build v8.9.70.",
            feedback_count=342,
            average_sentiment=-0.91,
            growth_rate=0.74,
            severity=0.95,
            user_impact=0.94,
            priority_score=0.89,
            frequency_score=0.92,
            severity_score=0.95,
            growth_score=0.89,
            user_impact_score=0.94,
            negative_sentiment_score=0.91,
            product_dimension={
                "account_id": "acc_spotify",
                "platform": "Android",
                "version": "v8.9.70",
                "feature": "Offline Playback Cache",
            },
            account_id="acc_spotify",
        )
        db.add(prob_s1)
        db.flush()

        for fid in ["fb_sp_01", "fb_sp_02", "fb_sp_03"]:
            db.execute(problem_feedback.insert().values(problem_id=prob_s1.id, feedback_id=fid, relevance_score=0.96))

        # Problem 2: Bluetooth desync
        prob_s2 = ProblemCluster(
            name="Bluetooth Headphone Auto-Pause Desync on Screen Lock",
            description="Playback automatically pauses when the device screen locks on Pixel and Samsung devices running Android 14 due to OS power-saving restriction.",
            feedback_count=184,
            average_sentiment=-0.85,
            growth_rate=0.38,
            severity=0.86,
            user_impact=0.85,
            priority_score=0.82,
            frequency_score=0.84,
            severity_score=0.86,
            growth_score=0.80,
            user_impact_score=0.85,
            negative_sentiment_score=0.85,
            product_dimension={
                "account_id": "acc_spotify",
                "platform": "Android 14",
                "version": "v8.9.70",
                "feature": "Audio Engine Service",
            },
            account_id="acc_spotify",
        )
        db.add(prob_s2)
        db.flush()

        # Problem 3: Lyrics lag
        prob_s3 = ProblemCluster(
            name="Lyrics Synchronization Lag on High-Latency Networks",
            description="Real-time lyrics line transitions lag 2-4 seconds behind vocal track on variable mobile networks.",
            feedback_count=88,
            average_sentiment=-0.58,
            growth_rate=-0.12,
            severity=0.60,
            user_impact=0.63,
            priority_score=0.65,
            frequency_score=0.62,
            severity_score=0.60,
            growth_score=0.55,
            user_impact_score=0.63,
            negative_sentiment_score=0.58,
            product_dimension={
                "account_id": "acc_spotify",
                "platform": "All Android",
                "feature": "Lyrics Engine",
            },
            account_id="acc_spotify",
        )
        db.add(prob_s3)
        db.flush()

        # Trends
        db.add(Trend(problem_id=prob_s1.id, time_window="7d", current_count=214, previous_count=123, growth_rate=0.74, is_emerging=True))
        db.add(Trend(problem_id=prob_s2.id, time_window="7d", current_count=118, previous_count=85, growth_rate=0.38, is_emerging=True))
        db.add(Trend(problem_id=prob_s3.id, time_window="7d", current_count=42, previous_count=48, growth_rate=-0.12, is_emerging=False))

        # Recommendations
        rec_s1 = Recommendation(
            problem_id=prob_s1.id,
            recommendation="Ship v8.9.72 Emergency Hotfix for DRM Offline Key Decryption Cache",
            reason="Network connectivity assertion erroneously blocked DRM license decryption key lookup when airplane mode was enabled on v8.9.70.",
            evidence={
                "observed": "342 Play Store & Reddit complaints of offline playback failure",
                "inferred": "Network connectivity check blocks local AES-128 key retrieval in airplane mode",
                "recommended": "Bypass network assertion in DRM verification when track was verified cached offline",
                "confidence": 0.98,
            },
            confidence=0.98,
        )
        db.add(rec_s1)
        db.flush()

        # Insights
        ins_s1 = Insight(
            problem_id=prob_s1.id,
            summary="v8.9.70 regression directly prevents offline music playback on airplanes and subways, threatening Premium subscriber retention.",
            why_it_matters="Offline listening is the primary reason users subscribe to paid Premium tier ($10.99/mo). Hotfix must be prioritized within 24 hours.",
            evidence={
                "sample_feedback_ids": ["fb_sp_01", "fb_sp_02", "fb_sp_03"],
                "total_complaints": 342,
                "negative_sentiment_pct": 91,
            },
            recommended_actions=[
                "Bypass network check in DRM verification when track is locally cached",
                "Expedite Google Play review for v8.9.72 emergency hotfix build",
                "Publish in-app banner acknowledging issue and providing temporary airplane mode workaround",
            ],
            suggested_response="Hi there, we apologize for the airplane mode playback issue! Our engineering team has identified the cause in build v8.9.70 and will release hotfix build v8.9.72 within the next 24 hours. Thank you for your patience.",
        )
        db.add(ins_s1)

        # Action
        act_s1 = Action(
            action_id="act_spotify_01",
            problem_id=prob_s1.id,
            recommendation_id=rec_s1.id,
            account_id="acc_spotify",
            title="v8.9.72 Hotfix Deployment to Play Store Production Track",
            description="Patch DRM offline key validator unit tests, deploy 5% staged rollout to beta testers, then promote build to 100% production rollout.",
            action_type="bug_fix",
            status="in_progress",
            assignee="Elena Rostova (Android Core PM)",
            jira_issue_key="MOB-4412",
            release_version="v8.9.72",
            baseline_metrics={"feedback_count": 214, "negative_ratio": 0.91, "priority_score": 0.89},
        )
        db.add(act_s1)
        db.commit()
        print(f"      Seeded {len(spotify_feedback_data)} feedback items, 3 problems, 3 trends, 1 recommendation, 1 action for Spotify Android.")

        # =========================================================================
        # ACCOUNT 4: VJ SIDHU VLOGS (acc_vj_sidhu)
        # =========================================================================
        print("\n[5/5] Checking Account 4: VJ Sidhu Vlogs (acc_vj_sidhu)...")
        # Ensure VJ Sidhu starts completely clean/empty for live YouTube extraction
        vj_fb = db.query(Feedback).filter(Feedback.account_id == "acc_vj_sidhu").count()
        vj_prob = db.query(ProblemCluster).filter(ProblemCluster.account_id == "acc_vj_sidhu").count()
        print(f"      VJ Sidhu Vlogs is initialized with {vj_fb} feedback items and {vj_prob} problem clusters (Clean state for Live YouTube API sync).")

        print("\n" + "=" * 80)
        print(" [OK] MULTI-ACCOUNT DATABASE SEEDING COMPLETED SUCCESSFULLY!")
        print("=" * 80 + "\n")

    finally:
        db.close()


if __name__ == "__main__":
    seed_all_accounts()
