from datetime import datetime, timezone
from typing import Any, Dict, List, Optional
from sqlalchemy.orm import Session

from app.core.logging import get_logger
from app.core.exceptions import EntityNotFoundException, ValidationException
from app.db.models import ProblemCluster, Recommendation, Action, Feedback, FeedbackAnalysis
from app.actions.schemas import (
    ActionCreate,
    ActionUpdate,
    ActionReleaseRequest,
    ActionStatus,
    ActionType,
    ImpactMeasurementResponse,
)
from app.actions.repository import ActionRepository

logger = get_logger("action_service")


class ActionService:
    def __init__(self, db: Session):
        self.db = db
        self.repo = ActionRepository(db)

    def _snapshot_baseline_metrics(self, problem: ProblemCluster) -> Dict[str, Any]:
        """Capture problem cluster state before action implementation."""
        # Query negative sentiment count
        total_items = len(problem.feedback_items)
        neg_count = sum(
            1 for item in problem.feedback_items
            if item.analysis and item.analysis.sentiment == "negative"
        )
        neg_ratio = (neg_count / total_items) if total_items > 0 else 0.0

        return {
            "feedback_count": total_items,
            "negative_feedback_count": neg_count,
            "negative_ratio": round(neg_ratio, 3),
            "priority_score": round(problem.priority_score, 3),
            "severity_score": round(problem.severity_score, 3),
            "growth_rate": round(problem.growth_rate, 3),
            "snapshot_timestamp": datetime.now(timezone.utc).isoformat(),
        }

    def create_action(self, payload: ActionCreate) -> Action:
        """Create closed-loop action linked to problem and optional recommendation."""
        problem = self.db.query(ProblemCluster).filter(ProblemCluster.id == payload.problem_id).first()
        if not problem:
            raise EntityNotFoundException(f"ProblemCluster with id {payload.problem_id} does not exist.")

        if payload.recommendation_id:
            rec = self.db.query(Recommendation).filter(Recommendation.id == payload.recommendation_id).first()
            if not rec:
                raise EntityNotFoundException(f"Recommendation with id {payload.recommendation_id} does not exist.")

        baseline = self._snapshot_baseline_metrics(problem)
        action = self.repo.create(payload, baseline_metrics=baseline)
        logger.info(f"Created Action '{action.action_id}' (Status: {action.status}) for Problem {problem.id} ('{problem.name}').")
        return action

    def create_from_recommendation(
        self,
        recommendation_id: int,
        title: Optional[str] = None,
        assignee: Optional[str] = None,
        jira_issue_key: Optional[str] = None,
        target_version: Optional[str] = None,
    ) -> Action:
        """One-click transition from Recommendation -> Closed-loop Action."""
        rec = self.db.query(Recommendation).filter(Recommendation.id == recommendation_id).first()
        if not rec:
            raise EntityNotFoundException(f"Recommendation {recommendation_id} not found.")

        action_title = title or f"Implement: {rec.recommendation[:80]}"
        payload = ActionCreate(
            problem_id=rec.problem_id,
            recommendation_id=rec.id,
            title=action_title,
            description=f"Action initiated from Recommendation #{rec.id}:\n{rec.recommendation}\n\nEvidence Reason: {rec.reason}",
            action_type=ActionType.BUG_FIX,
            assignee=assignee,
            jira_issue_key=jira_issue_key,
            target_version=target_version,
        )
        return self.create_action(payload)

    def start_implementation(self, action_id: str, assignee: Optional[str] = None, jira_key: Optional[str] = None) -> Action:
        """Move action to IN_PROGRESS status."""
        action = self.repo.get_by_action_id(action_id)
        if not action:
            raise EntityNotFoundException(f"Action '{action_id}' not found.")

        updates: Dict[str, Any] = {"status": ActionStatus.IN_PROGRESS.value}
        if assignee:
            updates["assignee"] = assignee
        if jira_key:
            updates["jira_issue_key"] = jira_key

        updated = self.repo.update(action, updates)
        logger.info(f"Action '{action_id}' moved to IN_PROGRESS (Assignee: {updated.assignee}).")
        return updated

    def release_action(self, action_id: str, release_payload: ActionReleaseRequest) -> Action:
        """Mark action as RELEASED with version and release timestamp."""
        action = self.repo.get_by_action_id(action_id)
        if not action:
            raise EntityNotFoundException(f"Action '{action_id}' not found.")

        rel_date = release_payload.release_date or datetime.now(timezone.utc)
        updates = {
            "status": ActionStatus.RELEASED.value,
            "release_version": release_payload.release_version,
            "release_date": rel_date,
        }
        updated = self.repo.update(action, updates)
        logger.info(f"Action '{action_id}' RELEASED in version {release_payload.release_version} at {rel_date}.")
        return updated

    def measure_impact(self, action_id: str) -> ImpactMeasurementResponse:
        """Closed-loop verification: Evaluates post-release customer feedback against baseline."""
        action = self.repo.get_by_action_id(action_id)
        if not action:
            raise EntityNotFoundException(f"Action '{action_id}' not found.")

        problem = self.db.query(ProblemCluster).filter(ProblemCluster.id == action.problem_id).first()
        if not problem:
            raise EntityNotFoundException(f"Associated problem {action.problem_id} not found.")

        baseline = action.baseline_metrics or self._snapshot_baseline_metrics(problem)
        base_count = baseline.get("feedback_count", len(problem.feedback_items))
        base_neg_ratio = baseline.get("negative_ratio", 0.80)
        base_priority = baseline.get("priority_score", problem.priority_score)

        release_date = action.release_date
        release_ver = action.release_version

        # Filter problem feedback arriving after release_date
        post_items: List[Feedback] = []
        if release_date:
            rel_dt = release_date.replace(tzinfo=timezone.utc) if release_date.tzinfo is None else release_date
            for item in problem.feedback_items:
                item_dt = item.created_at.replace(tzinfo=timezone.utc) if item.created_at.tzinfo is None else item.created_at
                if item_dt >= rel_dt:
                    post_items.append(item)
                elif release_ver and item.extra_metadata and str(item.extra_metadata.get("version", "")) == release_ver:
                    post_items.append(item)
        else:
            # If not released yet, measure against items created in last 24h
            post_items = [
                i for i in problem.feedback_items
                if release_ver and i.extra_metadata and str(i.extra_metadata.get("version", "")) == release_ver
            ]

        post_count = len(post_items)
        post_neg_count = sum(
            1 for item in post_items
            if item.analysis and item.analysis.sentiment == "negative"
        )
        post_neg_ratio = (post_neg_count / post_count) if post_count > 0 else 0.0

        # Calculate deltas & normalized rates
        if base_count > 0:
            vol_reduction = max(-1.0, min(1.0, (base_count - post_count) / base_count))
        else:
            vol_reduction = 0.0

        sentiment_delta = base_neg_ratio - post_neg_ratio  # positive means negative sentiment decreased
        priority_drop = max(0.0, (base_priority - problem.priority_score) / max(0.01, base_priority))

        # Composite impact score [-1.0, 1.0]
        impact_score = round(
            (0.50 * vol_reduction) + (0.30 * sentiment_delta) + (0.20 * priority_drop),
            3
        )
        is_successful = (impact_score >= 0.35) or (base_count > 5 and post_count == 0)

        # Update action status and metrics
        new_status = ActionStatus.RESOLVED if is_successful else ActionStatus.MEASURING
        post_metrics = {
            "post_release_feedback_count": post_count,
            "post_release_negative_count": post_neg_count,
            "post_release_negative_ratio": round(post_neg_ratio, 3),
            "current_problem_priority": round(problem.priority_score, 3),
            "measured_at": datetime.now(timezone.utc).isoformat(),
        }

        summary = (
            f"Impact analysis for '{action.title}' (Release: {release_ver or 'N/A'}): "
            f"Complaint volume decreased by {round(vol_reduction * 100, 1)}% ({base_count} pre-release vs {post_count} post-release). "
            f"Negative sentiment shifted from {round(base_neg_ratio * 100, 1)}% to {round(post_neg_ratio * 100, 1)}%. "
            f"Overall impact score: {impact_score} ({'SUCCESS / RESOLVED' if is_successful else 'MEASURING / MONITORING'})."
        )

        self.repo.update(action, {
            "status": new_status.value,
            "post_release_metrics": post_metrics,
            "impact_score": impact_score,
            "impact_summary": summary,
        })

        return ImpactMeasurementResponse(
            action_id=action.action_id,
            problem_id=problem.id,
            problem_name=problem.name,
            status=new_status,
            release_version=release_ver,
            release_date=release_date,
            baseline_metrics=baseline,
            post_release_metrics=post_metrics,
            volume_reduction_pct=round(vol_reduction * 100, 2),
            negative_sentiment_delta=round(sentiment_delta * 100, 2),
            priority_drop_pct=round(priority_drop * 100, 2),
            impact_score=impact_score,
            is_successful=is_successful,
            summary=summary,
        )

    def list_actions(
        self,
        problem_id: Optional[int] = None,
        recommendation_id: Optional[int] = None,
        status: Optional[str] = None,
        limit: int = 50,
        skip: int = 0,
    ) -> Dict[str, Any]:
        items, total = self.repo.list_actions(
            problem_id=problem_id,
            recommendation_id=recommendation_id,
            status=status,
            limit=limit,
            skip=skip,
        )
        return {"items": items, "total": total}

    def get_action(self, action_id: str) -> Action:
        action = self.repo.get_by_action_id(action_id)
        if not action:
            raise EntityNotFoundException(f"Action '{action_id}' not found.")
        return action

    def update_action(self, action_id: str, payload: ActionUpdate) -> Action:
        action = self.repo.get_by_action_id(action_id)
        if not action:
            raise EntityNotFoundException(f"Action '{action_id}' not found.")
        return self.repo.update(action, payload.model_dump(exclude_unset=True))
