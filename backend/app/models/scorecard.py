import uuid
from datetime import date, datetime, timezone

from sqlalchemy import (
    Boolean, Date, DateTime, ForeignKey, Integer, Numeric, String, Text,
    UniqueConstraint,
)
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class Scorecard(Base):
    """A scorecard for an org unit (department, area, or team) for a given year."""
    __tablename__ = "scorecards"
    __table_args__ = (
        UniqueConstraint("company_id", "year", "org_level", "org_entity_id",
                         name="uq_scorecard_org_year"),
    )

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    company_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("companies.id"))
    year: Mapped[int] = mapped_column(Integer)
    org_level: Mapped[str] = mapped_column(String(20))  # department | area | team
    org_entity_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True))
    name: Mapped[str] = mapped_column(String(300))
    operational_weight: Mapped[float] = mapped_column(
        Numeric(5, 2), default=50.0, server_default="50.00"
    )
    management_weight: Mapped[float] = mapped_column(
        Numeric(5, 2), default=50.0, server_default="50.00"
    )
    active: Mapped[bool] = mapped_column(Boolean, default=True, server_default="true")

    indicators: Mapped[list["ScorecardIndicator"]] = relationship(
        back_populates="scorecard", cascade="all, delete-orphan",
        lazy="selectin", order_by="ScorecardIndicator.order_idx",
    )


class ScorecardIndicator(Base):
    """An individual objective/KPI within a scorecard."""
    __tablename__ = "scorecard_indicators"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    scorecard_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("scorecards.id", ondelete="CASCADE"))
    name: Mapped[str] = mapped_column(String(500))
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    category: Mapped[str] = mapped_column(String(20))  # operational | management
    indicator_type: Mapped[str] = mapped_column(
        String(20), default="continuous"
    )  # continuous | binary | count
    target_value: Mapped[float] = mapped_column(Numeric(12, 4))
    unit: Mapped[str] = mapped_column(String(20), default="%")
    weight_pct: Mapped[float] = mapped_column(Numeric(5, 2))
    direction: Mapped[str] = mapped_column(
        String(15), default="higher_better"
    )  # higher_better | lower_better
    frequency: Mapped[str] = mapped_column(
        String(15), default="monthly"
    )  # weekly | monthly | quarterly | annual
    start_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    end_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    source: Mapped[str | None] = mapped_column(String(100), nullable=True)
    source_config: Mapped[dict | None] = mapped_column(JSONB, nullable=True)
    kpi_definition_id: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("kpi_definitions.id", ondelete="SET NULL"), nullable=True,
    )
    project_id: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("projects.id", ondelete="SET NULL"), nullable=True,
    )
    connector_id: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("connectors.id", ondelete="SET NULL"), nullable=True,
    )
    shared_group_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), nullable=True, index=True,
    )
    order_idx: Mapped[int] = mapped_column(Integer, default=0)
    active: Mapped[bool] = mapped_column(Boolean, default=True, server_default="true")

    scorecard: Mapped["Scorecard"] = relationship(back_populates="indicators")
    values: Mapped[list["IndicatorValue"]] = relationship(
        back_populates="indicator", cascade="all, delete-orphan",
        lazy="selectin", order_by="IndicatorValue.period",
    )


class IndicatorValue(Base):
    """A periodic measurement for a scorecard indicator."""
    __tablename__ = "indicator_values"
    __table_args__ = (
        UniqueConstraint("indicator_id", "year", "period_type", "period",
                         name="uq_indicator_value_period"),
    )

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    indicator_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("scorecard_indicators.id", ondelete="CASCADE"),
    )
    year: Mapped[int] = mapped_column(Integer)
    period_type: Mapped[str] = mapped_column(String(15))  # monthly | quarterly | annual
    period: Mapped[int] = mapped_column(Integer)  # 1-12 monthly, 1-4 quarterly, 0 annual
    value: Mapped[float] = mapped_column(Numeric(12, 4))
    collected_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc),
    )
    collection_method: Mapped[str] = mapped_column(
        String(20), default="manual"
    )  # manual | automatic
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    actions_done: Mapped[str | None] = mapped_column(Text, nullable=True)
    actions_next: Mapped[str | None] = mapped_column(Text, nullable=True)

    indicator: Mapped["ScorecardIndicator"] = relationship(back_populates="values")
