"""Clean Purge & Reset Database Script.

Deletes all mock/test records across Feedback, NLP Analyses, Embeddings,
Problems, Trends, Recommendations, Insights, and Actions tables,
leaving the PostgreSQL database clean for 100% real live YouTube data.
"""

import os
import sys

# Ensure backend root is on sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from sqlalchemy import delete
from app.db.database import SessionLocal, engine
from app.db.models import (
    Action,
    Insight,
    Recommendation,
    Trend,
    problem_feedback,
    ProblemCluster,
    FeedbackEmbedding,
    FeedbackAnalysis,
    Feedback,
)


def purge_mock_data():
    print("=" * 60)
    print(" [*] RESET DATABASE: PURGING ALL MOCK/TEST DATA")
    print("=" * 60)

    db = SessionLocal()
    try:
        # 1. Print existing counts
        fb_count = db.query(Feedback).count()
        prob_count = db.query(ProblemCluster).count()
        rec_count = db.query(Recommendation).count()
        action_count = db.query(Action).count()

        print(f"Current State before purge:")
        print(f"  - Feedback items:       {fb_count}")
        print(f"  - Problem Clusters:     {prob_count}")
        print(f"  - Recommendations:      {rec_count}")
        print(f"  - Actions:              {action_count}")
        print("-" * 60)

        # 2. Delete child records first to respect foreign keys
        print("Purging child tables...")
        deleted_actions = db.query(Action).delete(synchronize_session=False)
        deleted_insights = db.query(Insight).delete(synchronize_session=False)
        deleted_recs = db.query(Recommendation).delete(synchronize_session=False)
        deleted_trends = db.query(Trend).delete(synchronize_session=False)

        # Purge join table
        db.execute(delete(problem_feedback))

        # Purge problem clusters
        deleted_probs = db.query(ProblemCluster).delete(synchronize_session=False)

        # Purge analysis and embeddings
        deleted_embeddings = db.query(FeedbackEmbedding).delete(synchronize_session=False)
        deleted_analysis = db.query(FeedbackAnalysis).delete(synchronize_session=False)

        # Purge primary feedback
        deleted_fb = db.query(Feedback).delete(synchronize_session=False)

        db.commit()

        print(f"\n[+] Successfully purged all tables:")
        print(f"    - Actions removed:       {deleted_actions}")
        print(f"    - Insights removed:      {deleted_insights}")
        print(f"    - Recommendations:       {deleted_recs}")
        print(f"    - Trends removed:        {deleted_trends}")
        print(f"    - Problems removed:      {deleted_probs}")
        print(f"    - Embeddings removed:    {deleted_embeddings}")
        print(f"    - Analyses removed:      {deleted_analysis}")
        print(f"    - Feedback rows removed: {deleted_fb}")
        print("-" * 60)
        print("Database is completely CLEAN (0 rows) and ready for live YouTube ingestion!")
        print("=" * 60)

    except Exception as exc:
        db.rollback()
        print(f"[!] Error during database purge: {exc}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    purge_mock_data()
