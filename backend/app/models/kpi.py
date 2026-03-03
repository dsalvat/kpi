import uuid
from datetime import datetime
from decimal import Decimal

from sqlalchemy import DateTime, ForeignKey, Numeric, String, Text, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class KPIDefinition(Base):
    __tablename__ = "kpi_definitions"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    code: Mapped[str] = mapped_column(String(20), unique=True, index=True)
    name: Mapped[str] = mapped_column(String(200))
    category: Mapped[str] = mapped_column(String(50))
    unit: Mapped[str] = mapped_column(String(20))
    target: Mapped[Decimal] = mapped_column(Numeric)
    direction: Mapped[str] = mapped_column(String(15))  # higher_better | lower_better
    source: Mapped[str] = mapped_column(String(50))  # meraki | aruba | sap | itsm | manual
    n8n_workflow_id: Mapped[str | None] = mapped_column(String(100), nullable=True)
    active: Mapped[bool] = mapped_column(default=True)

    values: Mapped[list["KPIValue"]] = relationship(back_populates="kpi", cascade="all, delete-orphan")


class KPIValue(Base):
    __tablename__ = "kpi_values"
    __table_args__ = (UniqueConstraint("kpi_id", "year", "month", name="uq_kpi_year_month"),)

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    kpi_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("kpi_definitions.id"))
    year: Mapped[int]
    month: Mapped[int]
    value: Mapped[Decimal] = mapped_column(Numeric)
    collected_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)
    collection_method: Mapped[str] = mapped_column(String(20))  # n8n_automatic | manual
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)

    kpi: Mapped["KPIDefinition"] = relationship(back_populates="values")
