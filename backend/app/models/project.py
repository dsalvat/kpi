import uuid
from datetime import date
from decimal import Decimal

from sqlalchemy import Boolean, Date, ForeignKey, Numeric, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class Project(Base):
    __tablename__ = "projects"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    company_id: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("companies.id", ondelete="SET NULL"), nullable=True
    )
    code: Mapped[str] = mapped_column(String(20), unique=True, index=True)
    name: Mapped[str] = mapped_column(String(200))
    sponsor: Mapped[str | None] = mapped_column(String(100), nullable=True)
    status: Mapped[str] = mapped_column(String(20))  # active | completed | at_risk | blocked
    start_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    planned_end_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    actual_end_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    budget_eur: Mapped[Decimal | None] = mapped_column(Numeric, nullable=True)
    actual_cost_eur: Mapped[Decimal | None] = mapped_column(Numeric, nullable=True)
    completion_pct: Mapped[int | None] = mapped_column(nullable=True)
    sponsor_satisfaction: Mapped[Decimal | None] = mapped_column(Numeric, nullable=True)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    is_strategic: Mapped[bool] = mapped_column(Boolean, default=False, server_default="false")
