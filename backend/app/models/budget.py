import uuid
from datetime import datetime
from decimal import Decimal

from sqlalchemy import DateTime, Numeric, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class BudgetItem(Base):
    __tablename__ = "budget_items"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    year: Mapped[int]

    # Provider & team
    provider: Mapped[str] = mapped_column(String(200))
    managing_team: Mapped[str] = mapped_column(String(100))

    # Concept
    concept: Mapped[str] = mapped_column(Text)

    # Classification
    expense_type: Mapped[str] = mapped_column(String(50))
    classification: Mapped[str] = mapped_column(String(50))
    capex_opex: Mapped[str] = mapped_column(String(10))  # CAPEX | OPEX
    cost_center: Mapped[str | None] = mapped_column(String(100), nullable=True)

    # Amounts
    previous_year_budget: Mapped[Decimal | None] = mapped_column(Numeric, nullable=True)
    previous_year_cost: Mapped[Decimal | None] = mapped_column(Numeric, nullable=True)
    monthly_amount: Mapped[Decimal | None] = mapped_column(Numeric, nullable=True)
    annual_amount: Mapped[Decimal | None] = mapped_column(Numeric, nullable=True)

    # Tracking
    status: Mapped[str] = mapped_column(String(30), default="pendent")
    delivered: Mapped[bool] = mapped_column(default=False)
    reviewed: Mapped[bool] = mapped_column(default=False)

    # Execution tracking
    actual_amount: Mapped[Decimal | None] = mapped_column(Numeric, nullable=True)
    invoice_reference: Mapped[str | None] = mapped_column(String(200), nullable=True)
    order_reference: Mapped[str | None] = mapped_column(String(100), nullable=True)

    # Notes
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)

    # Timestamps
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)

    active: Mapped[bool] = mapped_column(default=True)


class BudgetLookup(Base):
    """Generic lookup table for budget categories: team, expense_type, classification, cost_center."""
    __tablename__ = "budget_lookups"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    category: Mapped[str] = mapped_column(String(30), index=True)
    value: Mapped[str] = mapped_column(String(200))
    display_order: Mapped[int] = mapped_column(default=0)
    active: Mapped[bool] = mapped_column(default=True)
