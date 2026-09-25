import uuid
from typing import Any, Dict, List, Optional, Tuple
from sqlalchemy.orm import Session
from sqlalchemy import desc

from app.db.models import Action
from app.actions.schemas import ActionCreate


class ActionRepository:
    def __init__(self, db: Session):
        self.db = db

    def create(self, item: ActionCreate, baseline_metrics: Optional[Dict[str, Any]] = None, action_id: Optional[str] = None) -> Action:
        act_id = action_id or f"act_{uuid.uuid4().hex[:10]}"
        action = Action(
            action_id=act_id,
            problem_id=item.problem_id,
            recommendation_id=item.recommendation_id,
            title=item.title,
            description=item.description,
            action_type=item.action_type.value if hasattr(item.action_type, "value") else str(item.action_type),
            status="planned",
            assignee=item.assignee,
            jira_issue_key=item.jira_issue_key,
            release_version=item.target_version,
            baseline_metrics=baseline_metrics or {},
        )
        self.db.add(action)
        self.db.commit()
        self.db.refresh(action)
        return action

    def get_by_id(self, id: int) -> Optional[Action]:
        return self.db.query(Action).filter(Action.id == id).first()

    def get_by_action_id(self, action_id: str) -> Optional[Action]:
        return self.db.query(Action).filter(Action.action_id == action_id).first()

    def list_actions(
        self,
        problem_id: Optional[int] = None,
        recommendation_id: Optional[int] = None,
        status: Optional[str] = None,
        limit: int = 50,
        skip: int = 0,
    ) -> Tuple[List[Action], int]:
        query = self.db.query(Action)
        if problem_id is not None:
            query = query.filter(Action.problem_id == problem_id)
        if recommendation_id is not None:
            query = query.filter(Action.recommendation_id == recommendation_id)
        if status:
            query = query.filter(Action.status == status)

        total = query.count()
        items = query.order_by(desc(Action.created_at)).offset(skip).limit(limit).all()
        return items, total

    def update(self, action: Action, update_dict: Dict[str, Any]) -> Action:
        for key, value in update_dict.items():
            if hasattr(action, key) and value is not None:
                if hasattr(value, "value"):
                    setattr(action, key, value.value)
                else:
                    setattr(action, key, value)
        self.db.commit()
        self.db.refresh(action)
        return action

    def delete(self, id: int) -> bool:
        action = self.get_by_id(id)
        if action:
            self.db.delete(action)
            self.db.commit()
            return True
        return False
