from datetime import datetime, timedelta, timezone
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.logging import logger
from app.db.models import ProblemCluster, Feedback, Trend, problem_feedback
from app.db.repositories.trend_repository import TrendRepository
from app.db.repositories.problem_repository import ProblemRepository


class TrendDetectionEngine:
    """Time-series analysis engine for problem clusters.
    
    Computes volume change over time windows, calculates growth velocity,
    and identifies emerging issues using minimum-volume statistical thresholds.
    """

    def __init__(self, db: Session):
        self.db = db
        self.trend_repo = TrendRepository(db)
        self.problem_repo = ProblemRepository(db)
        self.min_volume_threshold = settings.MIN_VOLUME_FOR_EMERGING  # e.g., 5
        self.growth_threshold = settings.EMERGING_GROWTH_THRESHOLD     # e.g., 0.50 (+50%)

    def analyze_problem_trend(
        self,
        problem_id: int,
        window_days: int = 7,
        reference_time: Optional[datetime] = None,
    ) -> Trend:
        """Compute current vs previous window volume and growth rate for a single problem."""
        ref_time = reference_time or datetime.now(timezone.utc)
        current_window_start = ref_time - timedelta(days=window_days)
        previous_window_start = ref_time - timedelta(days=window_days * 2)

        # Query all feedback timestamps linked to this problem
        feedback_dates = (
            self.db.query(Feedback.created_at)
            .join(problem_feedback, problem_feedback.c.feedback_id == Feedback.feedback_id)
            .filter(problem_feedback.c.problem_id == problem_id)
            .all()
        )

        current_count = 0
        previous_count = 0

        for (dt,) in feedback_dates:
            # Normalize dt timezone
            if dt.tzinfo is None:
                dt = dt.replace(tzinfo=timezone.utc)

            if dt >= current_window_start:
                current_count += 1
            elif previous_window_start <= dt < current_window_start:
                previous_count += 1

        # Calculate growth rate
        if previous_count == 0:
            growth_rate = 1.0 if current_count >= self.min_volume_threshold else 0.0
        else:
            growth_rate = (current_count - previous_count) / float(previous_count)

        # Emerging issue condition:
        # 1. Growth rate exceeds threshold (+50%)
        # 2. Minimum volume threshold is satisfied (avoids labeling 1 complaint as emerging)
        # 3. Current count > previous count
        is_emerging = bool(
            current_count >= self.min_volume_threshold
            and growth_rate >= self.growth_threshold
            and current_count > previous_count
        )

        trend = self.trend_repo.create_or_update(
            problem_id=problem_id,
            time_window=f"{window_days}d",
            current_count=current_count,
            previous_count=previous_count,
            growth_rate=round(growth_rate, 4),
            is_emerging=is_emerging,
        )

        # Update problem cluster growth_rate property
        problem = self.problem_repo.get_by_id(problem_id)
        if problem:
            problem.growth_rate = round(growth_rate, 4)
            self.db.commit()

        logger.info(
            f"Trend for Problem {problem_id} ({getattr(problem, 'name', '')}): "
            f"current={current_count}, previous={previous_count}, growth={growth_rate:.2%}, emerging={is_emerging}"
        )
        return trend

    def analyze_all_problems(
        self,
        window_days: int = 7,
        reference_time: Optional[datetime] = None,
        account_id: Optional[str] = None,
    ) -> List[Trend]:
        """Compute trends across problem clusters scoped to a single account."""
        problems, _ = self.problem_repo.get_all(limit=1000, account_id=account_id)
        trends = []
        for p in problems:
            trend = self.analyze_problem_trend(
                problem_id=p.id,
                window_days=window_days,
                reference_time=reference_time,
            )
            trends.append(trend)
        return trends
