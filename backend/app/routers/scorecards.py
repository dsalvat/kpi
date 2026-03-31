"""Scorecard endpoints for departmental objectives tracking."""

import uuid

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.schemas.scorecard import (
    IndicatorValueCreate,
    IndicatorValueRead,
    IndicatorValueUpdate,
    ScorecardCreate,
    ScorecardIndicatorCreate,
    ScorecardIndicatorRead,
    ScorecardIndicatorUpdate,
    ScorecardRead,
    ScorecardUpdate,
)
from app.services import scorecard_service as svc
from app.services.calculations import indicator_progress, kpi_status

router = APIRouter(prefix="/api/v1/scorecards", tags=["scorecards"])


# ══════════════════════════════════════════════════════════
# SCORECARDS
# ══════════════════════════════════════════════════════════

@router.get("/", response_model=list[ScorecardRead])
async def list_scorecards(
    company_id: uuid.UUID,
    year: int = 2026,
    db: AsyncSession = Depends(get_db),
):
    items = await svc.list_scorecards(db, company_id, year)
    result = []
    for item in items:
        sc = item["scorecard"]
        scores = item["scores"]
        # Enrich indicators
        for ind in sc.indicators:
            enriched = await svc._enrich_indicator(ind, year, db)
            ind.current_value = enriched["current_value"]
            ind.progress = enriched["progress"]
            ind.status = enriched["status"]
        sc.operational_score = scores.get("operational_score")
        sc.management_score = scores.get("management_score")
        sc.overall_score = scores.get("overall_score")
        sc.org_entity_name = item["org_entity_name"]
        sc.responsible_name = item["responsible_name"]
        result.append(sc)
    return result


@router.get("/tree/")
async def get_scorecard_tree(
    company_id: uuid.UUID,
    year: int = 2026,
    db: AsyncSession = Depends(get_db),
):
    """Hierarchical view: department → areas → teams with scores."""
    tree = await svc.get_scorecard_tree(db, company_id, year)
    # Serialize scorecards within tree nodes
    async def serialize_node(node):
        sc = node.get("scorecard")
        sc_data = None
        if sc:
            for ind in sc.indicators:
                enriched = await svc._enrich_indicator(ind, year, db)
                ind.current_value = enriched["current_value"]
                ind.progress = enriched["progress"]
                ind.status = enriched["status"]
            sc_data = ScorecardRead.model_validate(sc)
            sc_data.operational_score = node.get("operational_score")
            sc_data.management_score = node.get("management_score")
            sc_data.overall_score = node.get("overall_score")
            sc_data.org_entity_name = node.get("org_entity_name")
            sc_data.responsible_name = node.get("responsible_name")
        children = []
        for c in node.get("children", []):
            children.append(await serialize_node(c))
        return {
            "org_level": node["org_level"],
            "org_entity_id": node["org_entity_id"],
            "org_entity_name": node["org_entity_name"],
            "responsible_name": node.get("responsible_name"),
            "overall_score": node.get("overall_score"),
            "operational_score": node.get("operational_score"),
            "management_score": node.get("management_score"),
            "scorecard": sc_data,
            "children": children,
        }
    result = []
    for n in tree:
        result.append(await serialize_node(n))
    return result


@router.get("/{scorecard_id}", response_model=ScorecardRead)
async def get_scorecard(
    scorecard_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
):
    sc = await svc.get_scorecard(db, scorecard_id)
    if not sc:
        raise HTTPException(status_code=404, detail="Scorecard not found")
    scores = await svc._compute_scores(sc, sc.year, db)
    entity_name, resp_name = await svc._get_org_entity_info(db, sc.org_level, sc.org_entity_id)
    for ind in sc.indicators:
        enriched = await svc._enrich_indicator(ind, sc.year, db)
        ind.current_value = enriched["current_value"]
        ind.progress = enriched["progress"]
        ind.status = enriched["status"]
    sc.operational_score = scores.get("operational_score")
    sc.management_score = scores.get("management_score")
    sc.overall_score = scores.get("overall_score")
    sc.org_entity_name = entity_name
    sc.responsible_name = resp_name
    return sc


@router.post("/", response_model=ScorecardRead, status_code=201)
async def create_scorecard(
    data: ScorecardCreate,
    db: AsyncSession = Depends(get_db),
):
    sc = await svc.create_scorecard(db, data.model_dump())
    return sc


@router.put("/{scorecard_id}", response_model=ScorecardRead)
async def update_scorecard(
    scorecard_id: uuid.UUID,
    data: ScorecardUpdate,
    db: AsyncSession = Depends(get_db),
):
    sc = await svc.update_scorecard(db, scorecard_id, data.model_dump(exclude_unset=True))
    if not sc:
        raise HTTPException(status_code=404, detail="Scorecard not found")
    return sc


@router.delete("/{scorecard_id}", status_code=204)
async def delete_scorecard(
    scorecard_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
):
    ok = await svc.delete_scorecard(db, scorecard_id)
    if not ok:
        raise HTTPException(status_code=404, detail="Scorecard not found")


# ══════════════════════════════════════════════════════════
# INDICATORS
# ══════════════════════════════════════════════════════════

@router.post("/{scorecard_id}/indicators/", response_model=ScorecardIndicatorRead, status_code=201)
async def add_indicator(
    scorecard_id: uuid.UUID,
    data: ScorecardIndicatorCreate,
    db: AsyncSession = Depends(get_db),
):
    ind = await svc.add_indicator(db, scorecard_id, data.model_dump())
    return ind


@router.put("/indicators/{indicator_id}", response_model=ScorecardIndicatorRead)
async def update_indicator(
    indicator_id: uuid.UUID,
    data: ScorecardIndicatorUpdate,
    db: AsyncSession = Depends(get_db),
):
    ind = await svc.update_indicator(db, indicator_id, data.model_dump(exclude_unset=True))
    if not ind:
        raise HTTPException(status_code=404, detail="Indicator not found")
    return ind


@router.delete("/indicators/{indicator_id}", status_code=204)
async def delete_indicator(
    indicator_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
):
    ok = await svc.delete_indicator(db, indicator_id)
    if not ok:
        raise HTTPException(status_code=404, detail="Indicator not found")


# ══════════════════════════════════════════════════════════
# INDICATOR VALUES
# ══════════════════════════════════════════════════════════

@router.get("/indicators/{indicator_id}/values/", response_model=list[IndicatorValueRead])
async def list_indicator_values(
    indicator_id: uuid.UUID,
    year: int | None = None,
    db: AsyncSession = Depends(get_db),
):
    return await svc.list_indicator_values(db, indicator_id, year)


@router.post("/indicators/{indicator_id}/values/", response_model=IndicatorValueRead, status_code=201)
async def add_value(
    indicator_id: uuid.UUID,
    data: IndicatorValueCreate,
    db: AsyncSession = Depends(get_db),
):
    val = await svc.add_value(db, indicator_id, data.model_dump())
    return val


@router.put("/values/{value_id}", response_model=IndicatorValueRead)
async def update_value(
    value_id: uuid.UUID,
    data: IndicatorValueUpdate,
    db: AsyncSession = Depends(get_db),
):
    val = await svc.update_value(db, value_id, data.model_dump(exclude_unset=True))
    if not val:
        raise HTTPException(status_code=404, detail="Value not found")
    return val


@router.delete("/values/{value_id}", status_code=204)
async def delete_value(
    value_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
):
    ok = await svc.delete_value(db, value_id)
    if not ok:
        raise HTTPException(status_code=404, detail="Value not found")
