import uuid
from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field


class BusinessBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255, description="Name of the business or product")


class BusinessCreate(BusinessBase):
    pass


class BusinessRead(BusinessBase):
    id: uuid.UUID
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
