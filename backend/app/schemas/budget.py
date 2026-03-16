import uuid
from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, Field

# ── Budget Item Schemas ──


class BudgetItemCreate(BaseModel):
    year: int
    provider: str = Field(min_length=1, max_length=200)
    managing_team: str = Field(min_length=1, max_length=100)
    concept: str = Field(min_length=1)
    expense_type: str = Field(min_length=1, max_length=50)
    classification: str = Field(min_length=1, max_length=50)
    capex_opex: str = Field(pattern=r"^(CAPEX|OPEX)$")
    cost_center: str | None = None
    previous_year_budget: Decimal | None = None
    previous_year_cost: Decimal | None = None
    monthly_amount: Decimal | None = None
    annual_amount: Decimal | None = None
    status: str = "pendent"
    delivered: bool = False
    reviewed: bool = False
    actual_amount: Decimal | None = None
    invoice_reference: str | None = None
    order_reference: str | None = None
    notes: str | None = None


class BudgetItemUpdate(BaseModel):
    provider: str | None = None
    managing_team: str | None = None
    concept: str | None = None
    expense_type: str | None = None
    classification: str | None = None
    capex_opex: str | None = None
    cost_center: str | None = None
    previous_year_budget: Decimal | None = None
    previous_year_cost: Decimal | None = None
    monthly_amount: Decimal | None = None
    annual_amount: Decimal | None = None
    status: str | None = None
    delivered: bool | None = None
    reviewed: bool | None = None
    actual_amount: Decimal | None = None
    invoice_reference: str | None = None
    order_reference: str | None = None
    notes: str | None = None


class BudgetItemRead(BaseModel):
    id: uuid.UUID
    year: int
    provider: str
    managing_team: str
    concept: str
    expense_type: str
    classification: str
    capex_opex: str
    cost_center: str | None = None
    previous_year_budget: Decimal | None = None
    previous_year_cost: Decimal | None = None
    monthly_amount: Decimal | None = None
    annual_amount: Decimal | None = None
    status: str
    delivered: bool
    reviewed: bool
    actual_amount: Decimal | None = None
    invoice_reference: str | None = None
    order_reference: str | None = None
    notes: str | None = None
    created_at: datetime
    updated_at: datetime
    active: bool

    # Computed fields
    execution_pct: float | None = None
    deviation: Decimal | None = None

    model_config = {"from_attributes": True}


class BudgetSummaryRead(BaseModel):
    year: int
    total_budget: Decimal
    total_actual: Decimal
    total_items: int
    capex_budget: Decimal
    opex_budget: Decimal
    capex_actual: Decimal
    opex_actual: Decimal
    by_team: list[dict]
    by_status: dict[str, int]
    execution_pct: float | None = None


# ── Budget Lookup Schemas ──


class BudgetLookupCreate(BaseModel):
    category: str = Field(pattern=r"^(team|expense_type|classification|cost_center)$")
    value: str = Field(min_length=1, max_length=200)
    display_order: int = 0


class BudgetLookupUpdate(BaseModel):
    value: str | None = None
    display_order: int | None = None
    active: bool | None = None


class BudgetLookupRead(BaseModel):
    id: uuid.UUID
    category: str
    value: str
    display_order: int
    active: bool

    model_config = {"from_attributes": True}
