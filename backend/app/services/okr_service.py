from datetime import UTC, datetime
from decimal import Decimal

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.kpi import KPIDefinition, KPIValue
from app.models.okr import OKRKeyResult, OKRObjective, OKRQuarterlyData
from app.models.organization import Member, Team
from app.models.project import Project
from app.schemas.okr import (
    OKRKeyResultCreate,
    OKRKeyResultUpdate,
    OKRObjectiveCreate,
    OKRObjectiveUpdate,
    OKRQuarterlyDataUpdate,
)
from app.services.calculations import (
    aggregate_kpi_quarterly,
    kr_annual_progress,
    kr_progress,
    objective_progress,
)


# ── Batch name resolution ────────────────────────────────────


async def _batch_resolve_names(
    db: AsyncSession,
    team_ids: set,
    member_ids: set,
    project_ids: set,
    kpi_ids: set,
) -> dict:
    """Resolve UUIDs to display names in batch queries."""
    names: dict = {"teams": {}, "members": {}, "projects": {}, "kpis": {}}

    if team_ids:
        stmt = select(Team.id, Team.name).where(Team.id.in_(team_ids))
        rows = await db.execute(stmt)
        names["teams"] = {r[0]: r[1] for r in rows}

    if member_ids:
        stmt = select(Member.id, Member.first_name, Member.last_name).where(
            Member.id.in_(member_ids)
        )
        rows = await db.execute(stmt)
        names["members"] = {r[0]: f"{r[1]} {r[2]}" for r in rows}

    if project_ids:
        stmt = select(Project.id, Project.code, Project.name).where(
            Project.id.in_(project_ids)
        )
        rows = await db.execute(stmt)
        names["projects"] = {r[0]: {"code": r[1], "name": r[2]} for r in rows}

    if kpi_ids:
        stmt = select(KPIDefinition.id, KPIDefinition.code, KPIDefinition.name).where(
            KPIDefinition.id.in_(kpi_ids)
        )
        rows = await db.execute(stmt)
        names["kpis"] = {r[0]: {"code": r[1], "name": r[2]} for r in rows}

    return names


async def _batch_kpi_monthly_values(
    db: AsyncSession, kpi_ids: set, year: int
) -> dict:
    """Fetch all monthly KPI values for given KPI IDs and year.

    Returns: {kpi_id: [(month, value), ...]}
    """
    if not kpi_ids:
        return {}
    stmt = (
        select(KPIValue.kpi_id, KPIValue.month, KPIValue.value)
        .where(KPIValue.kpi_id.in_(kpi_ids), KPIValue.year == year)
        .order_by(KPIValue.month)
    )
    rows = await db.execute(stmt)
    result: dict = {}
    for kpi_id, month, value in rows:
        result.setdefault(kpi_id, []).append((month, float(value)))
    return result


# ── List objectives with auto-calculation ─────────────────────


async def list_objectives(db: AsyncSession, year: int) -> list[dict]:
    stmt = (
        select(OKRObjective)
        .where(OKRObjective.year == year)
        .options(
            selectinload(OKRObjective.key_results).selectinload(
                OKRKeyResult.quarterly_data
            )
        )
        .order_by(OKRObjective.order_idx)
    )
    result = await db.execute(stmt)
    objectives = result.scalars().all()

    # Collect all IDs for batch resolution
    team_ids: set = set()
    member_ids: set = set()
    project_ids: set = set()
    kpi_ids: set = set()

    for obj in objectives:
        if obj.responsible_team_id:
            team_ids.add(obj.responsible_team_id)
        if obj.responsible_member_id:
            member_ids.add(obj.responsible_member_id)
        for kr in obj.key_results:
            if kr.responsible_team_id:
                team_ids.add(kr.responsible_team_id)
            if kr.responsible_member_id:
                member_ids.add(kr.responsible_member_id)
            if kr.project_id:
                project_ids.add(kr.project_id)
            if kr.kpi_id:
                kpi_ids.add(kr.kpi_id)

    # Batch queries
    names = await _batch_resolve_names(db, team_ids, member_ids, project_ids, kpi_ids)
    kpi_monthly = await _batch_kpi_monthly_values(db, kpi_ids, year)

    # Enrich
    enriched = []
    for obj in objectives:
        kr_progresses = []
        kr_data = []
        for kr in obj.key_results:
            quarterly = sorted(kr.quarterly_data, key=lambda q: q.quarter)

            # Auto-calculate from KPI if linked and not manual
            auto_actuals: dict = {}
            if kr.kpi_id and kr.kpi_aggregation and kr.kpi_id in kpi_monthly:
                monthly = kpi_monthly[kr.kpi_id]
                for q in range(1, 5):
                    auto_actuals[q] = aggregate_kpi_quarterly(
                        monthly, q, kr.kpi_aggregation
                    )

            q_progresses = []
            q_data = []
            for qd in quarterly:
                # Determine actual: manual overrides auto
                is_auto = False
                actual = qd.actual
                if not qd.is_manual and qd.actual is None and qd.quarter in auto_actuals:
                    auto_val = auto_actuals[qd.quarter]
                    if auto_val is not None:
                        actual = Decimal(str(round(auto_val, 4)))
                        is_auto = True

                prog = None
                if actual is not None and qd.target is not None:
                    prog = kr_progress(float(actual), float(qd.target), kr.direction)
                q_progresses.append(prog)

                q_data.append({
                    "id": qd.id,
                    "year": qd.year,
                    "quarter": qd.quarter,
                    "target": qd.target,
                    "actual": actual,
                    "progress": prog,
                    "is_manual": qd.is_manual,
                    "is_auto_calculated": is_auto,
                    "notes": qd.notes,
                    "updated_at": qd.updated_at,
                })

            annual = kr_annual_progress(q_progresses)
            kr_progresses.append(annual)

            # Resolve KR names
            kpi_info = names["kpis"].get(kr.kpi_id) if kr.kpi_id else None
            proj_info = names["projects"].get(kr.project_id) if kr.project_id else None

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
                "kpi_code": kpi_info["code"] if kpi_info else None,
                "kpi_name": kpi_info["name"] if kpi_info else None,
                "project_id": kr.project_id,
                "project_name": proj_info["name"] if proj_info else None,
                "responsible_team_id": kr.responsible_team_id,
                "responsible_member_id": kr.responsible_member_id,
                "responsible_team_name": names["teams"].get(kr.responsible_team_id),
                "responsible_member_name": names["members"].get(kr.responsible_member_id),
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
            "responsible_team_id": obj.responsible_team_id,
            "responsible_member_id": obj.responsible_member_id,
            "responsible_team_name": names["teams"].get(obj.responsible_team_id),
            "responsible_member_name": names["members"].get(obj.responsible_member_id),
            "progress": obj_progress,
            "key_results": kr_data,
        })

    return enriched


# ── Update quarterly data ─────────────────────────────────────


async def update_quarterly_data(
    db: AsyncSession, qd_id, data: OKRQuarterlyDataUpdate
) -> OKRQuarterlyData | None:
    stmt = select(OKRQuarterlyData).where(OKRQuarterlyData.id == qd_id)
    result = await db.execute(stmt)
    qd = result.scalar_one_or_none()
    if not qd:
        return None

    if data.reset_auto:
        qd.actual = None
        qd.is_manual = False
    elif data.actual is not None:
        qd.actual = data.actual
        qd.is_manual = True
    if data.notes is not None:
        qd.notes = data.notes
    qd.updated_at = datetime.now(UTC)

    await db.commit()
    await db.refresh(qd)
    return qd


# ── OKR Summary ───────────────────────────────────────────────


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


# ── CRUD Objectives ───────────────────────────────────────────


async def create_objective(
    db: AsyncSession, data: OKRObjectiveCreate
) -> OKRObjective:
    obj = OKRObjective(
        year=data.year,
        code=data.code,
        title=data.title,
        owner=data.owner,
        responsible_team_id=data.responsible_team_id,
        responsible_member_id=data.responsible_member_id,
        order_idx=data.order_idx,
    )
    db.add(obj)
    await db.commit()
    await db.refresh(obj)
    return obj


async def update_objective(
    db: AsyncSession, obj_id, data: OKRObjectiveUpdate
) -> OKRObjective | None:
    stmt = select(OKRObjective).where(OKRObjective.id == obj_id)
    result = await db.execute(stmt)
    obj = result.scalar_one_or_none()
    if not obj:
        return None

    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(obj, field, value)

    await db.commit()
    await db.refresh(obj)
    return obj


async def delete_objective(db: AsyncSession, obj_id) -> bool:
    stmt = select(OKRObjective).where(OKRObjective.id == obj_id).options(
        selectinload(OKRObjective.key_results).selectinload(
            OKRKeyResult.quarterly_data
        )
    )
    result = await db.execute(stmt)
    obj = result.scalar_one_or_none()
    if not obj:
        return False
    await db.delete(obj)
    await db.commit()
    return True


# ── CRUD Key Results ──────────────────────────────────────────


async def create_key_result(
    db: AsyncSession, data: OKRKeyResultCreate
) -> OKRKeyResult:
    # Verify objective exists and get its year
    stmt = select(OKRObjective).where(OKRObjective.id == data.objective_id)
    result = await db.execute(stmt)
    obj = result.scalar_one_or_none()
    if not obj:
        raise ValueError("Objective not found")

    kr = OKRKeyResult(
        objective_id=data.objective_id,
        code=data.code,
        title=data.title,
        unit=data.unit,
        baseline=data.baseline,
        annual_target=data.annual_target,
        direction=data.direction,
        kpi_id=data.kpi_id,
        kpi_aggregation=data.kpi_aggregation,
        project_id=data.project_id,
        responsible_team_id=data.responsible_team_id,
        responsible_member_id=data.responsible_member_id,
        confidence=data.confidence,
    )
    db.add(kr)
    await db.flush()  # get kr.id

    # Create 4 quarterly data rows
    for q in range(1, 5):
        qd = OKRQuarterlyData(
            key_result_id=kr.id,
            year=obj.year,
            quarter=q,
            is_manual=False,
        )
        db.add(qd)

    await db.commit()
    await db.refresh(kr)
    return kr


async def update_key_result(
    db: AsyncSession, kr_id, data: OKRKeyResultUpdate
) -> OKRKeyResult | None:
    stmt = select(OKRKeyResult).where(OKRKeyResult.id == kr_id)
    result = await db.execute(stmt)
    kr = result.scalar_one_or_none()
    if not kr:
        return None

    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(kr, field, value)

    await db.commit()
    await db.refresh(kr)
    return kr


async def delete_key_result(db: AsyncSession, kr_id) -> bool:
    stmt = select(OKRKeyResult).where(OKRKeyResult.id == kr_id).options(
        selectinload(OKRKeyResult.quarterly_data)
    )
    result = await db.execute(stmt)
    kr = result.scalar_one_or_none()
    if not kr:
        return False
    await db.delete(kr)
    await db.commit()
    return True
