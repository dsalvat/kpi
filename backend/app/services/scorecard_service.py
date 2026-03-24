"""Service layer for scorecards, indicators, and values."""

import uuid
from datetime import datetime, timezone

from sqlalchemy import select, delete
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.scorecard import IndicatorValue, Scorecard, ScorecardIndicator
from app.models.organization import Area, Department, Member, Team
from app.services.calculations import (
    category_score,
    indicator_progress,
    kpi_status,
    scorecard_score,
)


# ── Load options ──

def _scorecard_load_options():
    return [
        selectinload(Scorecard.indicators).selectinload(ScorecardIndicator.values),
    ]


# ── Helpers ──

def _enrich_indicator(ind: ScorecardIndicator, year: int) -> dict:
    """Compute progress and status for a single indicator."""
    # Find latest value for the year
    year_values = [v for v in ind.values if v.year == year]
    current_value = None
    if year_values:
        latest = max(year_values, key=lambda v: (v.period, v.collected_at))
        current_value = float(latest.value)

    progress = indicator_progress(
        current_value, float(ind.target_value), ind.direction, ind.indicator_type
    )
    status = None
    if current_value is not None:
        status = kpi_status(current_value, float(ind.target_value), ind.direction)

    return {
        "current_value": current_value,
        "progress": progress,
        "status": status,
    }


def _compute_scores(scorecard: Scorecard, year: int) -> dict:
    """Compute operational_score, management_score, overall_score."""
    op_indicators = []
    mgmt_indicators = []

    for ind in scorecard.indicators:
        if not ind.active:
            continue
        enriched = _enrich_indicator(ind, year)
        entry = {"progress": enriched["progress"], "weight_pct": float(ind.weight_pct)}
        if ind.category == "operational":
            op_indicators.append(entry)
        else:
            mgmt_indicators.append(entry)

    op_score = category_score(op_indicators)
    mgmt_score = category_score(mgmt_indicators)
    overall = scorecard_score(
        op_score, mgmt_score,
        float(scorecard.operational_weight),
        float(scorecard.management_weight),
    )
    return {
        "operational_score": op_score,
        "management_score": mgmt_score,
        "overall_score": overall,
    }


async def _get_org_entity_info(
    db: AsyncSession, org_level: str, org_entity_id: uuid.UUID,
) -> tuple[str, str | None]:
    """Get org entity name and responsible person name."""
    if org_level == "department":
        stmt = select(Department).where(Department.id == org_entity_id).options(
            selectinload(Department.director)
        )
        dept = (await db.execute(stmt)).scalar_one_or_none()
        if dept:
            resp = f"{dept.director.first_name} {dept.director.last_name}" if dept.director else None
            return dept.name, resp
    elif org_level == "area":
        stmt = select(Area).where(Area.id == org_entity_id).options(
            selectinload(Area.responsable)
        )
        area = (await db.execute(stmt)).scalar_one_or_none()
        if area:
            resp = f"{area.responsable.first_name} {area.responsable.last_name}" if area.responsable else None
            return area.name, resp
    elif org_level == "team":
        stmt = select(Team).where(Team.id == org_entity_id).options(
            selectinload(Team.coordinador)
        )
        team = (await db.execute(stmt)).scalar_one_or_none()
        if team:
            resp = f"{team.coordinador.first_name} {team.coordinador.last_name}" if team.coordinador else None
            return team.name, resp
    return "Unknown", None


# ══════════════════════════════════════════════════════════
# SCORECARDS CRUD
# ══════════════════════════════════════════════════════════

async def list_scorecards(
    db: AsyncSession, company_id: uuid.UUID, year: int,
) -> list[dict]:
    """List all scorecards for a company+year with computed scores."""
    stmt = (
        select(Scorecard)
        .where(Scorecard.company_id == company_id, Scorecard.year == year, Scorecard.active == True)
        .options(*_scorecard_load_options())
        .order_by(Scorecard.org_level, Scorecard.name)
    )
    result = await db.execute(stmt)
    scorecards = result.scalars().all()

    output = []
    for sc in scorecards:
        scores = _compute_scores(sc, year)
        entity_name, resp_name = await _get_org_entity_info(db, sc.org_level, sc.org_entity_id)
        output.append({
            "scorecard": sc,
            "scores": scores,
            "org_entity_name": entity_name,
            "responsible_name": resp_name,
        })
    return output


async def get_scorecard(db: AsyncSession, scorecard_id: uuid.UUID) -> Scorecard | None:
    stmt = (
        select(Scorecard)
        .where(Scorecard.id == scorecard_id)
        .options(*_scorecard_load_options())
    )
    result = await db.execute(stmt)
    return result.scalar_one_or_none()


async def create_scorecard(db: AsyncSession, data: dict) -> Scorecard:
    sc = Scorecard(**data)
    db.add(sc)
    await db.flush()
    await db.refresh(sc, attribute_names=["indicators"])
    await db.commit()
    return sc


async def update_scorecard(db: AsyncSession, scorecard_id: uuid.UUID, data: dict) -> Scorecard | None:
    sc = await get_scorecard(db, scorecard_id)
    if not sc:
        return None
    for key, val in data.items():
        if val is not None:
            setattr(sc, key, val)
    await db.commit()
    await db.refresh(sc, attribute_names=["indicators"])
    return sc


async def delete_scorecard(db: AsyncSession, scorecard_id: uuid.UUID) -> bool:
    sc = await get_scorecard(db, scorecard_id)
    if not sc:
        return False
    await db.delete(sc)
    await db.commit()
    return True


# ══════════════════════════════════════════════════════════
# SCORECARD TREE (hierarchical view)
# ══════════════════════════════════════════════════════════

async def get_scorecard_tree(
    db: AsyncSession, company_id: uuid.UUID, year: int,
) -> list[dict]:
    """Build hierarchical tree: department → areas → teams with scores.

    Area scores cascade from their teams if the area has no own scorecard.
    """
    scorecards_data = await list_scorecards(db, company_id, year)

    # Index by (org_level, org_entity_id)
    sc_map: dict[tuple[str, str], dict] = {}
    for item in scorecards_data:
        sc = item["scorecard"]
        key = (sc.org_level, str(sc.org_entity_id))
        sc_map[key] = item

    # Get org structure
    dept_stmt = (
        select(Department)
        .where(Department.company_id == company_id, Department.active == True)
        .options(
            selectinload(Department.director),
            selectinload(Department.areas).selectinload(Area.responsable),
            selectinload(Department.areas).selectinload(Area.teams).selectinload(Team.coordinador),
        )
    )
    depts = (await db.execute(dept_stmt)).scalars().all()

    tree = []
    for dept in depts:
        dept_key = ("department", str(dept.id))
        dept_item = sc_map.get(dept_key)
        dept_scores = dept_item["scores"] if dept_item else {}

        area_nodes = []
        for area in dept.areas:
            if not area.active:
                continue
            area_key = ("area", str(area.id))
            area_item = sc_map.get(area_key)

            team_nodes = []
            team_scores_for_cascade = []
            for team in area.teams:
                if not team.active:
                    continue
                team_key = ("team", str(team.id))
                team_item = sc_map.get(team_key)
                team_scores = team_item["scores"] if team_item else {}
                if team_scores.get("overall_score") is not None:
                    team_scores_for_cascade.append(team_scores["overall_score"])

                coord_name = None
                if team.coordinador:
                    coord_name = f"{team.coordinador.first_name} {team.coordinador.last_name}"

                team_nodes.append({
                    "org_level": "team",
                    "org_entity_id": str(team.id),
                    "org_entity_name": team.name,
                    "responsible_name": coord_name,
                    "scorecard": team_item["scorecard"] if team_item else None,
                    "overall_score": team_scores.get("overall_score"),
                    "operational_score": team_scores.get("operational_score"),
                    "management_score": team_scores.get("management_score"),
                    "children": [],
                })

            # Area cascading: if area has own scorecard, use it; otherwise average team scores
            area_scores = area_item["scores"] if area_item else {}
            if area_scores.get("overall_score") is None and team_scores_for_cascade:
                cascaded = sum(team_scores_for_cascade) / len(team_scores_for_cascade)
                area_scores = {
                    "overall_score": cascaded,
                    "operational_score": None,
                    "management_score": None,
                }

            resp_name = None
            if area.responsable:
                resp_name = f"{area.responsable.first_name} {area.responsable.last_name}"

            area_nodes.append({
                "org_level": "area",
                "org_entity_id": str(area.id),
                "org_entity_name": area.name,
                "responsible_name": resp_name,
                "scorecard": area_item["scorecard"] if area_item else None,
                "overall_score": area_scores.get("overall_score"),
                "operational_score": area_scores.get("operational_score"),
                "management_score": area_scores.get("management_score"),
                "children": team_nodes,
            })

        dir_name = None
        if dept.director:
            dir_name = f"{dept.director.first_name} {dept.director.last_name}"

        tree.append({
            "org_level": "department",
            "org_entity_id": str(dept.id),
            "org_entity_name": dept.name,
            "responsible_name": dir_name,
            "scorecard": dept_item["scorecard"] if dept_item else None,
            "overall_score": dept_scores.get("overall_score"),
            "operational_score": dept_scores.get("operational_score"),
            "management_score": dept_scores.get("management_score"),
            "children": area_nodes,
        })

    return tree


# ══════════════════════════════════════════════════════════
# INDICATORS CRUD
# ══════════════════════════════════════════════════════════

async def add_indicator(
    db: AsyncSession, scorecard_id: uuid.UUID, data: dict,
) -> ScorecardIndicator:
    ind = ScorecardIndicator(scorecard_id=scorecard_id, **data)
    db.add(ind)
    await db.flush()
    await db.refresh(ind, attribute_names=["values"])
    await db.commit()
    return ind


async def update_indicator(
    db: AsyncSession, indicator_id: uuid.UUID, data: dict,
) -> ScorecardIndicator | None:
    stmt = (
        select(ScorecardIndicator)
        .where(ScorecardIndicator.id == indicator_id)
        .options(selectinload(ScorecardIndicator.values))
    )
    ind = (await db.execute(stmt)).scalar_one_or_none()
    if not ind:
        return None
    for key, val in data.items():
        if val is not None:
            setattr(ind, key, val)
    await db.commit()
    await db.refresh(ind, attribute_names=["values"])
    return ind


async def delete_indicator(db: AsyncSession, indicator_id: uuid.UUID) -> bool:
    stmt = select(ScorecardIndicator).where(ScorecardIndicator.id == indicator_id)
    ind = (await db.execute(stmt)).scalar_one_or_none()
    if not ind:
        return False
    await db.delete(ind)
    await db.commit()
    return True


# ══════════════════════════════════════════════════════════
# INDICATOR VALUES CRUD
# ══════════════════════════════════════════════════════════

async def add_value(
    db: AsyncSession, indicator_id: uuid.UUID, data: dict,
) -> IndicatorValue:
    val = IndicatorValue(indicator_id=indicator_id, **data)
    db.add(val)
    await db.flush()
    await db.commit()
    await db.refresh(val)
    return val


async def update_value(
    db: AsyncSession, value_id: uuid.UUID, data: dict,
) -> IndicatorValue | None:
    stmt = select(IndicatorValue).where(IndicatorValue.id == value_id)
    val = (await db.execute(stmt)).scalar_one_or_none()
    if not val:
        return None
    for key, val_data in data.items():
        if val_data is not None:
            setattr(val, key, val_data)
    await db.commit()
    await db.refresh(val)
    return val


async def delete_value(db: AsyncSession, value_id: uuid.UUID) -> bool:
    stmt = select(IndicatorValue).where(IndicatorValue.id == value_id)
    val = (await db.execute(stmt)).scalar_one_or_none()
    if not val:
        return False
    await db.delete(val)
    await db.commit()
    return True


async def list_indicator_values(
    db: AsyncSession, indicator_id: uuid.UUID, year: int | None = None,
) -> list[IndicatorValue]:
    stmt = select(IndicatorValue).where(IndicatorValue.indicator_id == indicator_id)
    if year:
        stmt = stmt.where(IndicatorValue.year == year)
    stmt = stmt.order_by(IndicatorValue.period)
    result = await db.execute(stmt)
    return list(result.scalars().all())
