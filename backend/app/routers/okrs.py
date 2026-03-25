import uuid
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.schemas.okr import (
    OKRKeyResultCreate,
    OKRKeyResultRead,
    OKRKeyResultUpdate,
    OKRObjectiveCreate,
    OKRObjectiveRead,
    OKRObjectiveUpdate,
    OKRQuarterlyDataRead,
    OKRQuarterlyDataUpdate,
)
from app.services import okr_service

router = APIRouter(prefix="/api/v1/okrs", tags=["okrs"])


# ── List / Summary ────────────────────────────────────────────


@router.get("/", response_model=list[OKRObjectiveRead])
async def list_okrs(
    year: int = Query(default_factory=lambda: datetime.now().year),
    db: AsyncSession = Depends(get_db),
):
    return await okr_service.list_objectives(db, year)


@router.get("/quarterly-review")
async def quarterly_review(
    year: int = Query(default_factory=lambda: datetime.now().year),
    db: AsyncSession = Depends(get_db),
):
    return await okr_service.get_okr_summary(db, year)


# ── Objectives CRUD ───────────────────────────────────────────


@router.post("/", response_model=OKRObjectiveRead, status_code=201)
async def create_objective(
    data: OKRObjectiveCreate,
    db: AsyncSession = Depends(get_db),
):
    obj = await okr_service.create_objective(db, data)
    # Return enriched version
    objectives = await okr_service.list_objectives(db, obj.year)
    for o in objectives:
        if o["id"] == obj.id:
            return o
    return obj


@router.put("/{obj_id}", response_model=OKRObjectiveRead)
async def update_objective(
    obj_id: uuid.UUID,
    data: OKRObjectiveUpdate,
    db: AsyncSession = Depends(get_db),
):
    obj = await okr_service.update_objective(db, obj_id, data)
    if not obj:
        raise HTTPException(status_code=404, detail="Objective not found")
    # Return enriched version
    objectives = await okr_service.list_objectives(db, obj.year)
    for o in objectives:
        if o["id"] == obj.id:
            return o
    return obj


@router.delete("/{obj_id}", status_code=204)
async def delete_objective(
    obj_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
):
    deleted = await okr_service.delete_objective(db, obj_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Objective not found")


# ── Key Results CRUD ──────────────────────────────────────────


@router.post("/key-results/", response_model=OKRKeyResultRead, status_code=201)
async def create_key_result(
    data: OKRKeyResultCreate,
    db: AsyncSession = Depends(get_db),
):
    try:
        kr = await okr_service.create_key_result(db, data)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    return kr


@router.put("/key-results/{kr_id}", response_model=OKRKeyResultRead)
async def update_key_result(
    kr_id: uuid.UUID,
    data: OKRKeyResultUpdate,
    db: AsyncSession = Depends(get_db),
):
    kr = await okr_service.update_key_result(db, kr_id, data)
    if not kr:
        raise HTTPException(status_code=404, detail="Key result not found")
    return kr


@router.delete("/key-results/{kr_id}", status_code=204)
async def delete_key_result(
    kr_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
):
    deleted = await okr_service.delete_key_result(db, kr_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Key result not found")


# ── Quarterly Data ────────────────────────────────────────────


@router.put("/quarterly/{qd_id}", response_model=OKRQuarterlyDataRead)
async def update_quarterly_data(
    qd_id: uuid.UUID,
    data: OKRQuarterlyDataUpdate,
    db: AsyncSession = Depends(get_db),
):
    result = await okr_service.update_quarterly_data(db, qd_id, data)
    if not result:
        raise HTTPException(status_code=404, detail="Quarterly data not found")
    return result
