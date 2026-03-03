import uuid
from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel


class OKRQuarterlyDataRead(BaseModel):
    id: uuid.UUID
    year: int
    quarter: int
    target: Decimal | None = None
    actual: Decimal | None = None
    progress: float | None = None  # computed
    is_manual: bool
    notes: str | None = None
    updated_at: datetime | None = None

    model_config = {"from_attributes": True}


class OKRQuarterlyDataUpdate(BaseModel):
    actual: Decimal | None = None
    notes: str | None = None


class OKRKeyResultRead(BaseModel):
    id: uuid.UUID
    code: str
    title: str
    unit: str
    baseline: Decimal | None = None
    annual_target: Decimal
    direction: str
    kpi_id: uuid.UUID | None = None
    kpi_aggregation: str | None = None
    confidence: str | None = None
    annual_progress: float | None = None  # computed
    quarterly_data: list[OKRQuarterlyDataRead] = []

    model_config = {"from_attributes": True}


class OKRObjectiveRead(BaseModel):
    id: uuid.UUID
    year: int
    code: str
    title: str
    owner: str | None = None
    progress: float | None = None  # computed
    key_results: list[OKRKeyResultRead] = []

    model_config = {"from_attributes": True}


class OKRSummaryRead(BaseModel):
    year: int
    objectives: list[OKRObjectiveRead]
    overall_progress: float | None = None
