from datetime import datetime, timezone
from decimal import Decimal

from sqlalchemy import delete, distinct, func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.kpi import KPIDefinition, KPIValue, KPIYearAssignment
from app.schemas.kpi import KPIDefinitionCreate, KPIDefinitionUpdate, KPIValueCreate, KPIValueUpdate
from app.services.calculations import kpi_status, kr_progress


GROUP_PREFIX = {
    "serveis": "SRV-",
    "projectes": "PRJ-",
    "valor": "VAL-",
}


async def _enrich_kpi(db: AsyncSession, kpi: KPIDefinition, year: int | None = None) -> dict:
    """Build enriched dict for a KPI definition including years and current status."""
    # Get year assignments
    stmt = select(KPIYearAssignment.year).where(KPIYearAssignment.kpi_id == kpi.id).order_by(KPIYearAssignment.year)
    result = await db.execute(stmt)
    years = [r[0] for r in result.all()]

    data = {
        "id": kpi.id,
        "code": kpi.code,
        "name": kpi.name,
        "description": kpi.description,
        "calculation_method": kpi.calculation_method,
        "group": kpi.group,
        "category": kpi.category,
        "unit": kpi.unit,
        "target": kpi.target,
        "direction": kpi.direction,
        "source": kpi.source,
        "n8n_workflow_id": kpi.n8n_workflow_id,
        "active": kpi.active,
        "years": years,
        "current_value": None,
        "current_status": "no_data",
        "current_month": None,
    }
    latest = await _get_latest_value(db, kpi.id, year)
    if latest:
        data["current_value"] = latest.value
        data["current_month"] = latest.month
        data["current_status"] = kpi_status(
            float(latest.value), float(kpi.target), kpi.direction
        )
    return data


async def list_kpis(
    db: AsyncSession,
    category: str | None = None,
    group: str | None = None,
    year: int | None = None,
):
    stmt = select(KPIDefinition).where(KPIDefinition.active.is_(True))
    if group:
        stmt = stmt.where(KPIDefinition.group == group)
    elif category:
        stmt = stmt.where(KPIDefinition.category == category)
    stmt = stmt.order_by(KPIDefinition.code)
    result = await db.execute(stmt)
    kpis = result.scalars().all()
    return [await _enrich_kpi(db, kpi, year) for kpi in kpis]


async def list_all_kpis(db: AsyncSession, include_inactive: bool = False):
    """List all KPI definitions (for master data management)."""
    stmt = select(KPIDefinition)
    if not include_inactive:
        stmt = stmt.where(KPIDefinition.active.is_(True))
    stmt = stmt.order_by(KPIDefinition.code)
    result = await db.execute(stmt)
    kpis = result.scalars().all()
    return [await _enrich_kpi(db, kpi) for kpi in kpis]


async def create_kpi_definition(db: AsyncSession, data: KPIDefinitionCreate) -> dict:
    """Create a new KPI definition with optional year assignments."""
    kpi = KPIDefinition(
        code=data.code,
        name=data.name,
        description=data.description,
        calculation_method=data.calculation_method,
        group=data.group,
        category=data.category,
        unit=data.unit,
        target=data.target,
        direction=data.direction,
        source=data.source,
        n8n_workflow_id=data.n8n_workflow_id,
        active=data.active,
    )
    db.add(kpi)
    await db.flush()

    for y in data.years:
        db.add(KPIYearAssignment(kpi_id=kpi.id, year=y))

    await db.commit()
    await db.refresh(kpi)
    return await _enrich_kpi(db, kpi)


async def update_kpi_definition(
    db: AsyncSession, code: str, data: KPIDefinitionUpdate
) -> dict | None:
    """Update an existing KPI definition."""
    kpi = await get_kpi_by_code(db, code)
    if not kpi:
        return None

    update_fields = data.model_dump(exclude_unset=True, exclude={"years"})
    for field, value in update_fields.items():
        setattr(kpi, field, value)

    # Update year assignments if provided
    if data.years is not None:
        await db.execute(
            delete(KPIYearAssignment).where(KPIYearAssignment.kpi_id == kpi.id)
        )
        for y in data.years:
            db.add(KPIYearAssignment(kpi_id=kpi.id, year=y))

    await db.commit()
    await db.refresh(kpi)
    return await _enrich_kpi(db, kpi)


async def delete_kpi_definition(db: AsyncSession, code: str) -> bool:
    """Delete a KPI definition and all associated data."""
    kpi = await get_kpi_by_code(db, code)
    if not kpi:
        return False
    await db.delete(kpi)
    await db.commit()
    return True


# ── Year management ──


async def get_available_years(db: AsyncSession) -> list[dict]:
    """Get all years with assignment counts."""
    stmt = (
        select(
            KPIYearAssignment.year,
            func.count(KPIYearAssignment.kpi_id).label("kpi_count"),
        )
        .group_by(KPIYearAssignment.year)
        .order_by(KPIYearAssignment.year.desc())
    )
    result = await db.execute(stmt)
    return [{"year": r.year, "kpi_count": r.kpi_count} for r in result.all()]


async def activate_year(db: AsyncSession, year: int) -> int:
    """Assign a year to all active KPIs that don't already have it. Returns count added."""
    # Get active KPIs that don't have this year
    subq = select(KPIYearAssignment.kpi_id).where(KPIYearAssignment.year == year)
    stmt = select(KPIDefinition.id).where(
        KPIDefinition.active.is_(True),
        KPIDefinition.id.not_in(subq),
    )
    result = await db.execute(stmt)
    kpi_ids = [r[0] for r in result.all()]

    for kpi_id in kpi_ids:
        db.add(KPIYearAssignment(kpi_id=kpi_id, year=year))

    await db.commit()
    return len(kpi_ids)


async def deactivate_year(db: AsyncSession, year: int) -> int:
    """Remove a year assignment from all KPIs. Returns count removed."""
    stmt = delete(KPIYearAssignment).where(KPIYearAssignment.year == year)
    result = await db.execute(stmt)
    await db.commit()
    return result.rowcount


async def _get_latest_value(
    db: AsyncSession, kpi_id, year: int | None = None
) -> KPIValue | None:
    stmt = (
        select(KPIValue)
        .where(KPIValue.kpi_id == kpi_id)
        .order_by(KPIValue.year.desc(), KPIValue.month.desc())
        .limit(1)
    )
    if year:
        stmt = stmt.where(KPIValue.year == year)
    result = await db.execute(stmt)
    return result.scalar_one_or_none()


async def get_kpi_by_code(db: AsyncSession, code: str) -> KPIDefinition | None:
    stmt = select(KPIDefinition).where(KPIDefinition.code == code)
    result = await db.execute(stmt)
    return result.scalar_one_or_none()


async def get_kpi_values(db: AsyncSession, code: str, year: int) -> list[KPIValue]:
    kpi = await get_kpi_by_code(db, code)
    if not kpi:
        return []
    stmt = (
        select(KPIValue)
        .where(KPIValue.kpi_id == kpi.id, KPIValue.year == year)
        .order_by(KPIValue.month)
    )
    result = await db.execute(stmt)
    return list(result.scalars().all())


async def create_kpi_value(db: AsyncSession, code: str, data: KPIValueCreate) -> KPIValue | None:
    kpi = await get_kpi_by_code(db, code)
    if not kpi:
        return None
    value = KPIValue(
        kpi_id=kpi.id,
        year=data.year,
        month=data.month,
        value=data.value,
        collected_at=datetime.now(timezone.utc),
        collection_method="manual",
        notes=data.notes,
    )
    db.add(value)
    await db.commit()
    await db.refresh(value)
    return value


async def update_kpi_value(
    db: AsyncSession, code: str, value_id: str, data: KPIValueUpdate
) -> KPIValue | None:
    kpi = await get_kpi_by_code(db, code)
    if not kpi:
        return None
    stmt = select(KPIValue).where(KPIValue.id == value_id, KPIValue.kpi_id == kpi.id)
    result = await db.execute(stmt)
    value = result.scalar_one_or_none()
    if not value:
        return None
    value.value = data.value
    value.notes = data.notes
    value.collected_at = datetime.now(timezone.utc)
    await db.commit()
    await db.refresh(value)
    return value


async def delete_kpi_value(db: AsyncSession, code: str, value_id: str) -> bool:
    kpi = await get_kpi_by_code(db, code)
    if not kpi:
        return False
    stmt = select(KPIValue).where(KPIValue.id == value_id, KPIValue.kpi_id == kpi.id)
    result = await db.execute(stmt)
    value = result.scalar_one_or_none()
    if not value:
        return False
    await db.delete(value)
    await db.commit()
    return True


async def get_kpi_status(db: AsyncSession, code: str):
    kpi = await get_kpi_by_code(db, code)
    if not kpi:
        return None
    latest = await _get_latest_value(db, kpi.id)
    value = float(latest.value) if latest else None
    progress = kr_progress(value, float(kpi.target), kpi.direction) if value else None
    status = kpi_status(value, float(kpi.target), kpi.direction)
    return {
        "code": kpi.code,
        "name": kpi.name,
        "status": status,
        "value": latest.value if latest else None,
        "target": kpi.target,
        "progress": progress,
    }
