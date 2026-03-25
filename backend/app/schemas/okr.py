import uuid
from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel


# ── Read schemas ──────────────────────────────────────────────


class OKRQuarterlyDataRead(BaseModel):
    id: uuid.UUID
    year: int
    quarter: int
    target: Decimal | None = None
    actual: Decimal | None = None
    progress: float | None = None  # computed
    is_manual: bool
    is_auto_calculated: bool = False  # True when actual computed from KPI values
    notes: str | None = None
    updated_at: datetime | None = None

    model_config = {"from_attributes": True}


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
    kpi_code: str | None = None
    kpi_name: str | None = None
    project_id: uuid.UUID | None = None
    project_name: str | None = None
    responsible_team_id: uuid.UUID | None = None
    responsible_member_id: uuid.UUID | None = None
    responsible_team_name: str | None = None
    responsible_member_name: str | None = None
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
    responsible_team_id: uuid.UUID | None = None
    responsible_member_id: uuid.UUID | None = None
    responsible_team_name: str | None = None
    responsible_member_name: str | None = None
    progress: float | None = None  # computed
    key_results: list[OKRKeyResultRead] = []

    model_config = {"from_attributes": True}


class OKRSummaryRead(BaseModel):
    year: int
    objectives: list[OKRObjectiveRead]
    overall_progress: float | None = None


# ── Update schemas ────────────────────────────────────────────


class OKRQuarterlyDataUpdate(BaseModel):
    actual: Decimal | None = None
    notes: str | None = None
    reset_auto: bool = False  # set True to clear manual override


# ── Create / Update schemas ───────────────────────────────────


class OKRObjectiveCreate(BaseModel):
    year: int
    code: str
    title: str
    owner: str | None = None
    responsible_team_id: uuid.UUID | None = None
    responsible_member_id: uuid.UUID | None = None
    order_idx: int = 0


class OKRObjectiveUpdate(BaseModel):
    title: str | None = None
    owner: str | None = None
    responsible_team_id: uuid.UUID | None = None
    responsible_member_id: uuid.UUID | None = None
    order_idx: int | None = None


class OKRKeyResultCreate(BaseModel):
    objective_id: uuid.UUID
    code: str
    title: str
    unit: str
    baseline: Decimal | None = None
    annual_target: Decimal
    direction: str
    kpi_id: uuid.UUID | None = None
    kpi_aggregation: str | None = None
    project_id: uuid.UUID | None = None
    responsible_team_id: uuid.UUID | None = None
    responsible_member_id: uuid.UUID | None = None
    confidence: str | None = None


class OKRKeyResultUpdate(BaseModel):
    title: str | None = None
    unit: str | None = None
    baseline: Decimal | None = None
    annual_target: Decimal | None = None
    direction: str | None = None
    kpi_id: uuid.UUID | None = None
    kpi_aggregation: str | None = None
    project_id: uuid.UUID | None = None
    responsible_team_id: uuid.UUID | None = None
    responsible_member_id: uuid.UUID | None = None
    confidence: str | None = None
