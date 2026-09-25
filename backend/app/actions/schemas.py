from datetime import datetime
from enum import Enum
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field, ConfigDict


class ActionStatus(str, Enum):
    PLANNED = "planned"
    IN_PROGRESS = "in_progress"
    RELEASED = "released"
    MEASURING = "measuring"
    RESOLVED = "resolved"
    DISMISSED = "dismissed"


class ActionType(str, Enum):
    BUG_FIX = "bug_fix"
    FEATURE = "feature"
    REFACTOR = "refactor"
    INFRASTRUCTURE = "infrastructure"
    UX_IMPROVEMENT = "ux_improvement"
    PROCESS_CHANGE = "process_change"


class ActionCreate(BaseModel):
    problem_id: int = Field(..., description="Target ProblemCluster ID")
    recommendation_id: Optional[int] = Field(None, description="Optional originating Recommendation ID")
    title: str = Field(..., min_length=3, max_length=256, description="Action title")
    description: Optional[str] = Field(None, description="Detailed implementation plan or scope")
    action_type: ActionType = Field(default=ActionType.BUG_FIX, description="Type of engineering or product action")
    assignee: Optional[str] = Field(None, description="Owner / engineering lead")
    jira_issue_key: Optional[str] = Field(None, description="Jira, Linear, or GitHub issue key (e.g. ENG-104)")
    target_version: Optional[str] = Field(None, description="Target release version (e.g. v4.2.2)")


class ActionUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    action_type: Optional[ActionType] = None
    status: Optional[ActionStatus] = None
    assignee: Optional[str] = None
    jira_issue_key: Optional[str] = None
    release_version: Optional[str] = None
    release_date: Optional[datetime] = None


class ActionReleaseRequest(BaseModel):
    release_version: str = Field(..., min_length=1, max_length=64, description="Production version deployed (e.g. v4.2.2)")
    release_date: Optional[datetime] = Field(None, description="Timestamp of deployment (defaults to UTC now)")
    notes: Optional[str] = Field(None, description="Deployment release notes or commit reference")


class ImpactMeasurementResponse(BaseModel):
    action_id: str
    problem_id: int
    problem_name: str
    status: ActionStatus
    release_version: Optional[str]
    release_date: Optional[datetime]
    baseline_metrics: Dict[str, Any]
    post_release_metrics: Dict[str, Any]
    volume_reduction_pct: float = Field(..., description="Percentage reduction in complaint rate (positive is improvement)")
    negative_sentiment_delta: float = Field(..., description="Reduction in negative sentiment fraction (positive is improvement)")
    priority_drop_pct: float = Field(..., description="Percentage drop in problem priority score")
    impact_score: float = Field(..., description="Composite impact metric [-1.0 to 1.0], > 0.5 indicates strong resolution")
    is_successful: bool = Field(..., description="Whether post-release impact met resolution criteria")
    summary: str = Field(..., description="Human-readable impact analysis narrative")


class ActionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    action_id: str
    problem_id: int
    recommendation_id: Optional[int] = None
    title: str
    description: Optional[str] = None
    action_type: str
    status: str
    assignee: Optional[str] = None
    jira_issue_key: Optional[str] = None
    release_version: Optional[str] = None
    release_date: Optional[datetime] = None
    baseline_metrics: Optional[Dict[str, Any]] = None
    post_release_metrics: Optional[Dict[str, Any]] = None
    impact_score: Optional[float] = None
    impact_summary: Optional[str] = None
    created_at: datetime
    updated_at: datetime


class ActionListResponse(BaseModel):
    items: List[ActionResponse]
    total: int
