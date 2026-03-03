from datetime import datetime, timezone

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.cache import invalidate_pattern
from app.models.kpi import KPIDefinition, KPIValue
from app.models.sync_log import N8nSyncLog
from app.schemas.ingest import KPIIngestPayload


async def ingest_kpi_value(db: AsyncSession, payload: KPIIngestPayload) -> KPIValue | None:
    stmt = select(KPIDefinition).where(KPIDefinition.code == payload.kpi_code)
    result = await db.execute(stmt)
    kpi = result.scalar_one_or_none()
    if not kpi:
        return None

    value = KPIValue(
        kpi_id=kpi.id,
        year=payload.year,
        month=payload.month,
        value=payload.value,
        collected_at=datetime.now(timezone.utc),
        collection_method="n8n_automatic",
        notes=payload.notes,
    )
    db.add(value)
    await db.commit()
    await db.refresh(value)

    # Invalidate dashboard cache for this year
    await invalidate_pattern(f"dashboard:{payload.year}")
    return value


async def ingest_batch(
    db: AsyncSession, payloads: list[KPIIngestPayload], workflow_id: str | None = None
) -> dict:
    log = N8nSyncLog(
        workflow_id=workflow_id or "unknown",
        status="success",
        kpis_collected=0,
        started_at=datetime.now(timezone.utc),
    )

    success_count = 0
    errors = []
    years_affected = set()

    for payload in payloads:
        try:
            result = await ingest_kpi_value(db, payload)
            if result:
                success_count += 1
                years_affected.add(payload.year)
            else:
                errors.append(f"KPI '{payload.kpi_code}' not found")
        except Exception as e:
            errors.append(f"Error ingesting {payload.kpi_code}: {str(e)}")

    log.kpis_collected = success_count
    log.finished_at = datetime.now(timezone.utc)
    if errors:
        log.status = "partial" if success_count > 0 else "error"
        log.error_message = "; ".join(errors)

    db.add(log)
    await db.commit()

    return {"ingested": success_count, "errors": errors, "log_id": str(log.id)}


async def get_sync_logs(db: AsyncSession, limit: int = 50) -> list[N8nSyncLog]:
    stmt = select(N8nSyncLog).order_by(N8nSyncLog.started_at.desc()).limit(limit)
    result = await db.execute(stmt)
    return list(result.scalars().all())
