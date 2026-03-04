from datetime import datetime, timezone
from decimal import Decimal

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.kpi import KPIDefinition, KPIValue
from app.schemas.kpi import KPIValueCreate, KPIValueUpdate
from app.services.calculations import kpi_status, kr_progress


GROUP_PREFIX = {
    "serveis": "SRV-",
    "projectes": "PRJ-M",
}


async def list_kpis(
    db: AsyncSession,
    category: str | None = None,
    group: str | None = None,
    year: int | None = None,
):
    stmt = select(KPIDefinition).where(KPIDefinition.active.is_(True))
    if group and group in GROUP_PREFIX:
        stmt = stmt.where(KPIDefinition.code.startswith(GROUP_PREFIX[group]))
    elif category:
        stmt = stmt.where(KPIDefinition.category == category)
    stmt = stmt.order_by(KPIDefinition.code)
    result = await db.execute(stmt)
    kpis = result.scalars().all()

    enriched = []
    for kpi in kpis:
        data = {
            "id": kpi.id,
            "code": kpi.code,
            "name": kpi.name,
            "category": kpi.category,
            "unit": kpi.unit,
            "target": kpi.target,
            "direction": kpi.direction,
            "source": kpi.source,
            "n8n_workflow_id": kpi.n8n_workflow_id,
            "active": kpi.active,
            "current_value": None,
            "current_status": "no_data",
            "current_month": None,
        }
        # Get latest value
        latest = await _get_latest_value(db, kpi.id, year)
        if latest:
            data["current_value"] = latest.value
            data["current_month"] = latest.month
            data["current_status"] = kpi_status(
                float(latest.value), float(kpi.target), kpi.direction
            )
        enriched.append(data)
    return enriched


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
