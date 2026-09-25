from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict


class TrendResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    problem_id: int
    problem_name: Optional[str] = None
    time_window: str
    current_count: int
    previous_count: int
    growth_rate: float
    is_emerging: bool
    calculated_at: datetime
