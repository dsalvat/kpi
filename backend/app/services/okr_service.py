from datetime import UTC, datetime

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.okr import OKRKeyResult, OKRObjective, OKRQuarterlyData
from app.schemas.okr import OKRQuarterlyDataUpdate
from app.services.calculations import kr_annual_progress, kr_progress, objective_progress


async def list_objectives(db: AsyncSession, year: int) -> list[dict]:
    stmt = (
        select(OKRObjective)
        .where(OKRObjective.year == year)
        .options(
            selectinload(OKRObjective.key_results).selectinload(OKRKeyResult.quarterly_data)
        )
        .order_by(OKRObjective.order_idx)
    )
    result = await db.execute(stmt)
    objectives = result.scalars().all()

    enriched = []
    for obj in objectives:
        kr_progresses = []
        kr_data = []
        for kr in obj.key_results:
            quarterly = sorted(kr.quarterly_data, key=lambda q: q.quarter)
            q_progresses = []
            q_data = []
            for qd in quarterly:
                prog = None
                if qd.actual is not None and qd.target is not None:
                    prog = kr_progress(float(qd.actual), float(qd.target), kr.direction)
                q_progresses.append(prog)
                q_data.append({
                    "id": qd.id,
                    "year": qd.year,
                    "quarter": qd.quarter,
                    "target": qd.target,
                    "actual": qd.actual,
                    "progress": prog,
                    "is_manual": qd.is_manual,
                    "notes": qd.notes,
                    "updated_at": qd.updated_at,
                })

            annual = kr_annual_progress(q_progresses)
            kr_progresses.append(annual)
            kr_data.append({
                "id": kr.id,
                "code": kr.code,
                "title": kr.title,
                "unit": kr.unit,
                "baseline": kr.baseline,
                "annual_target": kr.annual_target,
                "direction": kr.direction,
                "kpi_id": kr.kpi_id,
                "kpi_aggregation": kr.kpi_aggregation,
                "confidence": kr.confidence,
                "annual_progress": annual,
                "quarterly_data": q_data,
            })

        obj_progress = objective_progress(kr_progresses)
        enriched.append({
            "id": obj.id,
            "year": obj.year,
            "code": obj.code,
            "title": obj.title,
            "owner": obj.owner,
            "progress": obj_progress,
            "key_results": kr_data,
        })

    return enriched


async def update_quarterly_data(
    db: AsyncSession, qd_id, data: OKRQuarterlyDataUpdate
) -> OKRQuarterlyData | None:
    stmt = select(OKRQuarterlyData).where(OKRQuarterlyData.id == qd_id)
    result = await db.execute(stmt)
    qd = result.scalar_one_or_none()
    if not qd:
        return None

    if data.actual is not None:
        qd.actual = data.actual
        qd.is_manual = True
    if data.notes is not None:
        qd.notes = data.notes
    qd.updated_at = datetime.now(UTC)

    await db.commit()
    await db.refresh(qd)
    return qd


async def get_okr_summary(db: AsyncSession, year: int) -> dict:
    objectives = await list_objectives(db, year)
    all_progresses = [o["progress"] for o in objectives]
    valid = [p for p in all_progresses if p is not None]
    overall = sum(valid) / len(valid) if valid else None
    return {
        "year": year,
        "objectives": objectives,
        "overall_progress": overall,
    }
