import uuid
from datetime import date, datetime

from pydantic import BaseModel, ConfigDict


# ── Indicator Values ──

class IndicatorValueCreate(BaseModel):
    year: int
    period_type: str = "monthly"  # monthly | quarterly | annual
    period: int  # 1-12 monthly, 1-4 quarterly, 0 annual
    value: float
    collection_method: str = "manual"
    notes: str | None = None
    actions_done: str | None = None
    actions_next: str | None = None


class IndicatorValueUpdate(BaseModel):
    value: float | None = None
    notes: str | None = None
    actions_done: str | None = None
    actions_next: str | None = None


class IndicatorValueRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    indicator_id: uuid.UUID
    year: int
    period_type: str
    period: int
    value: float
    collected_at: datetime
    collection_method: str
    notes: str | None = None
    actions_done: str | None = None
    actions_next: str | None = None


# ── Scorecard Indicators ──

class ScorecardIndicatorCreate(BaseModel):
    name: str
    description: str | None = None
    category: str  # operational | management
    indicator_type: str = "continuous"  # continuous | binary | count
    target_value: float
    unit: str = "%"
    weight_pct: float = 16.67
    direction: str = "higher_better"
    frequency: str = "monthly"
    start_date: date | None = None
    end_date: date | None = None
    source: str | None = None
    source_config: dict | None = None
    kpi_definition_id: uuid.UUID | None = None
    project_id: uuid.UUID | None = None
    connector_id: uuid.UUID | None = None
    shared_group_id: uuid.UUID | None = None
    order_idx: int = 0


class ScorecardIndicatorUpdate(BaseModel):
    name: str | None = None
    description: str | None = None
    category: str | None = None
    indicator_type: str | None = None
    target_value: float | None = None
    unit: str | None = None
    weight_pct: float | None = None
    direction: str | None = None
    frequency: str | None = None
    start_date: date | None = None
    end_date: date | None = None
    source: str | None = None
    source_config: dict | None = None
    kpi_definition_id: uuid.UUID | None = None
    project_id: uuid.UUID | None = None
    connector_id: uuid.UUID | None = None
    shared_group_id: uuid.UUID | None = None
    order_idx: int | None = None


class ScorecardIndicatorRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    scorecard_id: uuid.UUID
    name: str
    description: str | None = None
    category: str
    indicator_type: str
    target_value: float
    unit: str
    weight_pct: float
    direction: str
    frequency: str
    start_date: date | None = None
    end_date: date | None = None
    source: str | None = None
    source_config: dict | None = None
    kpi_definition_id: uuid.UUID | None = None
    project_id: uuid.UUID | None = None
    connector_id: uuid.UUID | None = None
    shared_group_id: uuid.UUID | None = None
    order_idx: int
    active: bool
    values: list[IndicatorValueRead] = []
    # Computed fields (filled by service)
    current_value: float | None = None
    progress: float | None = None
    status: str | None = None


# ── Scorecards ──

class ScorecardCreate(BaseModel):
    company_id: uuid.UUID
    year: int
    org_level: str  # department | area | team
    org_entity_id: uuid.UUID
    name: str
    operational_weight: float = 50.0
    management_weight: float = 50.0


class ScorecardUpdate(BaseModel):
    name: str | None = None
    operational_weight: float | None = None
    management_weight: float | None = None


class ScorecardRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    company_id: uuid.UUID
    year: int
    org_level: str
    org_entity_id: uuid.UUID
    name: str
    operational_weight: float
    management_weight: float
    active: bool
    indicators: list[ScorecardIndicatorRead] = []
    # Computed fields (filled by service)
    operational_score: float | None = None
    management_score: float | None = None
    overall_score: float | None = None
    org_entity_name: str | None = None
    responsible_name: str | None = None


class ScorecardTreeNode(BaseModel):
    """A node in the hierarchical scorecard tree."""
    scorecard: ScorecardRead | None = None
    org_level: str
    org_entity_id: uuid.UUID
    org_entity_name: str
    responsible_name: str | None = None
    overall_score: float | None = None
    children: list["ScorecardTreeNode"] = []
