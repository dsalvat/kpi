import uuid
from datetime import datetime
from decimal import Decimal

from sqlalchemy import DateTime, ForeignKey, Numeric, String, Text, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class OKRObjective(Base):
    __tablename__ = "okr_objectives"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    year: Mapped[int]
    code: Mapped[str] = mapped_column(String(10))
    title: Mapped[str] = mapped_column(Text)
    owner: Mapped[str | None] = mapped_column(String(100), nullable=True)
    order_idx: Mapped[int] = mapped_column(default=0)
    responsible_team_id: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("teams.id", ondelete="SET NULL"), nullable=True
    )
    responsible_member_id: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("members.id", ondelete="SET NULL"), nullable=True
    )

    key_results: Mapped[list["OKRKeyResult"]] = relationship(
        back_populates="objective", cascade="all, delete-orphan"
    )


class OKRKeyResult(Base):
    __tablename__ = "okr_key_results"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    objective_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("okr_objectives.id"))
    code: Mapped[str] = mapped_column(String(15))  # O1.KR1
    title: Mapped[str] = mapped_column(Text)
    unit: Mapped[str] = mapped_column(String(20))
    baseline: Mapped[Decimal | None] = mapped_column(Numeric, nullable=True)
    annual_target: Mapped[Decimal] = mapped_column(Numeric)
    direction: Mapped[str] = mapped_column(String(15))  # higher_better | lower_better
    kpi_id: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("kpi_definitions.id"), nullable=True
    )
    kpi_aggregation: Mapped[str | None] = mapped_column(String(20), nullable=True)
    project_id: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("projects.id", ondelete="SET NULL"), nullable=True
    )
    responsible_team_id: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("teams.id", ondelete="SET NULL"), nullable=True
    )
    responsible_member_id: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("members.id", ondelete="SET NULL"), nullable=True
    )
    confidence: Mapped[str | None] = mapped_column(String(20), nullable=True)

    objective: Mapped["OKRObjective"] = relationship(back_populates="key_results")
    quarterly_data: Mapped[list["OKRQuarterlyData"]] = relationship(
        back_populates="key_result", cascade="all, delete-orphan"
    )


class OKRQuarterlyData(Base):
    __tablename__ = "okr_quarterly_data"
    __table_args__ = (
        UniqueConstraint("key_result_id", "year", "quarter", name="uq_kr_year_quarter"),
    )

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    key_result_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("okr_key_results.id"))
    year: Mapped[int]
    quarter: Mapped[int]
    target: Mapped[Decimal | None] = mapped_column(Numeric, nullable=True)
    actual: Mapped[Decimal | None] = mapped_column(Numeric, nullable=True)
    is_manual: Mapped[bool] = mapped_column(default=False)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    updated_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    key_result: Mapped["OKRKeyResult"] = relationship(back_populates="quarterly_data")
