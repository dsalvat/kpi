import uuid
from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, Field


class KPIDefinitionRead(BaseModel):
    id: uuid.UUID
    code: str
    name: str
    category: str
    unit: str
    target: Decimal
    direction: str
    source: str
    n8n_workflow_id: str | None = None
    active: bool
    current_value: Decimal | None = None
    current_status: str | None = None  # ok/warning/ko/no_data
    current_month: int | None = None

    model_config = {"from_attributes": True}


class KPIValueRead(BaseModel):
    id: uuid.UUID
    year: int
    month: int
    value: Decimal
    collected_at: datetime
    collection_method: str
    notes: str | None = None

    model_config = {"from_attributes": True}


class KPIValueCreate(BaseModel):
    year: int = Field(ge=2020, le=2100)
    month: int = Field(ge=1, le=12)
    value: Decimal
    notes: str | None = None


class KPIStatusRead(BaseModel):
    code: str
    name: str
    status: str
    value: Decimal | None = None
    target: Decimal
    progress: float | None = None
