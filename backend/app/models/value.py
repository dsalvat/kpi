import uuid
from decimal import Decimal

from sqlalchemy import ForeignKey, Numeric, String
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class ValueItem(Base):
    __tablename__ = "value_items"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    project_id: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("projects.id"), nullable=True
    )
    type: Mapped[str] = mapped_column(String(20))  # blue_money | green_money
    code: Mapped[str] = mapped_column(String(20))
    initiative: Mapped[str] = mapped_column(String(200))
    hours_saved_annual: Mapped[Decimal | None] = mapped_column(Numeric, nullable=True)
    hourly_rate_eur: Mapped[Decimal | None] = mapped_column(Numeric, nullable=True)
    operational_savings_eur: Mapped[Decimal | None] = mapped_column(Numeric, nullable=True)
    direct_savings_eur: Mapped[Decimal | None] = mapped_column(Numeric, nullable=True)
    revenues_enabled_eur: Mapped[Decimal | None] = mapped_column(Numeric, nullable=True)
    commercial_savings_eur: Mapped[Decimal | None] = mapped_column(Numeric, nullable=True)
    it_attribution_pct: Mapped[Decimal | None] = mapped_column(Numeric, nullable=True)
    year: Mapped[int]
