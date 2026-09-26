from typing import Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.api.dependencies import get_db
from app.actions.schemas import (
    ActionCreate,
    ActionUpdate,
    ActionReleaseRequest,
    ActionResponse,
    ActionListResponse,
    ImpactMeasurementResponse,
)
from app.actions.service import ActionService

router = APIRouter(prefix="/actions", tags=["Actions & Closed-Loop Impact"])


@router.post("", response_model=ActionResponse, status_code=status.HTTP_201_CREATED)
def create_action(
    payload: ActionCreate,
    db: Session = Depends(get_db),
):
    """Create a new closed-loop action linked to a problem and baseline metrics."""
    service = ActionService(db)
    return service.create_action(payload)


@router.post("/from-recommendation/{recommendation_id}", response_model=ActionResponse, status_code=status.HTTP_201_CREATED)
def create_action_from_recommendation(
    recommendation_id: int,
    title: Optional[str] = Query(None, description="Optional custom title for action"),
    assignee: Optional[str] = Query(None, description="Owner of the action"),
    jira_issue_key: Optional[str] = Query(None, description="Linked Jira/issue key"),
    target_version: Optional[str] = Query(None, description="Target release version"),
    db: Session = Depends(get_db),
):
    """Promote an evidence-backed Recommendation into an actionable closed-loop item."""
    service = ActionService(db)
    return service.create_from_recommendation(
        recommendation_id=recommendation_id,
        title=title,
        assignee=assignee,
        jira_issue_key=jira_issue_key,
        target_version=target_version,
    )


@router.get("", response_model=ActionListResponse)
def list_actions(
    problem_id: Optional[int] = Query(None, description="Filter by problem cluster ID"),
    recommendation_id: Optional[int] = Query(None, description="Filter by recommendation ID"),
    status: Optional[str] = Query(None, description="Filter by status (planned, in_progress, released, measuring, resolved)"),
    account_id: Optional[str] = Query(None, description="Optional account/company filter"),
    limit: int = Query(50, ge=1, le=200),
    skip: int = Query(0, ge=0),
    db: Session = Depends(get_db),
):
    """List tracked actions with pagination and filters."""
    service = ActionService(db)
    return service.list_actions(
        problem_id=problem_id,
        recommendation_id=recommendation_id,
        status=status,
        account_id=account_id,
        limit=limit,
        skip=skip,
    )


@router.get("/{action_id}", response_model=ActionResponse)
def get_action_details(
    action_id: str,
    db: Session = Depends(get_db),
):
    """Retrieve full details of an action including baseline and impact metrics."""
    service = ActionService(db)
    return service.get_action(action_id)


@router.patch("/{action_id}", response_model=ActionResponse)
def update_action(
    action_id: str,
    payload: ActionUpdate,
    db: Session = Depends(get_db),
):
    """Update action fields (assignee, Jira key, title, notes)."""
    service = ActionService(db)
    return service.update_action(action_id, payload)


@router.post("/{action_id}/start", response_model=ActionResponse)
def start_action_implementation(
    action_id: str,
    assignee: Optional[str] = Query(None),
    jira_key: Optional[str] = Query(None),
    db: Session = Depends(get_db),
):
    """Transition action status to IN_PROGRESS."""
    service = ActionService(db)
    return service.start_implementation(action_id, assignee=assignee, jira_key=jira_key)


@router.post("/{action_id}/release", response_model=ActionResponse)
def release_action(
    action_id: str,
    payload: ActionReleaseRequest,
    db: Session = Depends(get_db),
):
    """Record production deployment/release for the action."""
    service = ActionService(db)
    return service.release_action(action_id, payload)


@router.post("/{action_id}/measure", response_model=ImpactMeasurementResponse)
def measure_action_impact(
    action_id: str,
    db: Session = Depends(get_db),
):
    """Closed-loop verification: Evaluates post-release customer feedback against baseline to measure resolution."""
    service = ActionService(db)
    return service.measure_impact(action_id)
