import uuid
from decimal import Decimal

from pydantic import BaseModel


class ValueItemRead(BaseModel):
    id: uuid.UUID
    project_id: uuid.UUID | None = None
    type: str
    code: str
    initiative: str
    hours_saved_annual: Decimal | None = None
    hourly_rate_eur: Decimal | None = None
    operational_savings_eur: Decimal | None = None
    direct_savings_eur: Decimal | None = None
    revenues_enabled_eur: Decimal | None = None
    commercial_savings_eur: Decimal | None = None
    it_attribution_pct: Decimal | None = None
    year: int
    computed_value: float | None = None  # computed Blue or Green money

    model_config = {"from_attributes": True}


class ValueSummaryRead(BaseModel):
    year: int
    blue_money_total: float
    green_money_total: float
    blue_money_target: float | None = None
    green_money_target: float | None = None
    blue_items: list[ValueItemRead] = []
    green_items: list[ValueItemRead] = []


class ROIRead(BaseModel):
    year: int
    blue_total: float
    green_total: float
    total_value: float
    total_investment: float | None = None
    roi: float | None = None
