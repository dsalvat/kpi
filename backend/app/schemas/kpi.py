import uuid
from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, Field


class KPIDefinitionRead(BaseModel):
    id: uuid.UUID
    code: str
    name: str
    description: str | None = None
    calculation_method: str | None = None
    group: str
    category: str
    unit: str
    target: Decimal
    direction: str
    source: str
    source_type: str  # manual | api_rest | ai_agent
    connector_id: uuid.UUID | None = None
    connector_name: str | None = None
    n8n_workflow_id: str | None = None
    active: bool
    years: list[int] = []
    current_value: Decimal | None = None
    current_status: str | None = None  # ok/warning/ko/no_data
    current_month: int | None = None

    model_config = {"from_attributes": True}


class KPIDefinitionCreate(BaseModel):
    code: str = Field(min_length=1, max_length=20)
    name: str = Field(min_length=1, max_length=200)
    description: str | None = None
    calculation_method: str | None = None
    group: str = Field(pattern=r"^(serveis|projectes|valor)$")
    category: str = Field(min_length=1, max_length=50)
    unit: str = Field(min_length=1, max_length=20)
    target: Decimal
    direction: str = Field(pattern=r"^(higher_better|lower_better)$")
    source: str = Field(default="manual", max_length=50)
    source_type: str = Field(default="manual", pattern=r"^(manual|api_rest|ai_agent)$")
    connector_id: uuid.UUID | None = None
    n8n_workflow_id: str | None = None
    active: bool = True
    years: list[int] = []


class KPIDefinitionUpdate(BaseModel):
    code: str | None = None
    name: str | None = None
    description: str | None = None
    calculation_method: str | None = None
    group: str | None = None
    category: str | None = None
    unit: str | None = None
    target: Decimal | None = None
    direction: str | None = None
    source: str | None = None
    source_type: str | None = None
    connector_id: uuid.UUID | None = None
    n8n_workflow_id: str | None = None
    active: bool | None = None
    years: list[int] | None = None


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


class KPIValueUpdate(BaseModel):
    value: Decimal
    notes: str | None = None


class KPIStatusRead(BaseModel):
    code: str
    name: str
    status: str
    value: Decimal | None = None
    target: Decimal
    progress: float | None = None
