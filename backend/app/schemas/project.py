import uuid
from datetime import date
from decimal import Decimal

from pydantic import BaseModel


class ProjectRead(BaseModel):
    id: uuid.UUID
    code: str
    name: str
    sponsor: str | None = None
    status: str
    start_date: date | None = None
    planned_end_date: date | None = None
    actual_end_date: date | None = None
    budget_eur: Decimal | None = None
    actual_cost_eur: Decimal | None = None
    completion_pct: int | None = None
    sponsor_satisfaction: Decimal | None = None
    is_strategic: bool = False

    model_config = {"from_attributes": True}


class ProjectCreate(BaseModel):
    code: str
    name: str
    sponsor: str | None = None
    status: str = "active"
    start_date: date | None = None
    planned_end_date: date | None = None
    actual_end_date: date | None = None
    budget_eur: Decimal | None = None
    actual_cost_eur: Decimal | None = None
    completion_pct: int | None = None
    sponsor_satisfaction: Decimal | None = None
    description: str | None = None
    is_strategic: bool = False


class ProjectUpdate(BaseModel):
    name: str | None = None
    sponsor: str | None = None
    status: str | None = None
    start_date: date | None = None
    planned_end_date: date | None = None
    actual_end_date: date | None = None
    budget_eur: Decimal | None = None
    actual_cost_eur: Decimal | None = None
    completion_pct: int | None = None
    sponsor_satisfaction: Decimal | None = None
    description: str | None = None
    is_strategic: bool | None = None


class ProjectsSummary(BaseModel):
    total: int
    active: int
    at_risk: int
    completed: int
    blocked: int
    avg_completion_pct: float | None = None
