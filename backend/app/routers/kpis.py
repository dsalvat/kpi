from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.schemas.kpi import (
    KPIDefinitionCreate,
    KPIDefinitionRead,
    KPIDefinitionUpdate,
    KPIStatusRead,
    KPIValueCreate,
    KPIValueRead,
    KPIValueUpdate,
)
from app.services import kpi_service

router = APIRouter(prefix="/api/v1/kpis", tags=["kpis"])


# ── KPI Definition CRUD ──


@router.get("/", response_model=list[KPIDefinitionRead])
async def list_kpis(
    category: str | None = None,
    group: str | None = None,
    year: int | None = None,
    db: AsyncSession = Depends(get_db),
):
    return await kpi_service.list_kpis(db, category=category, group=group, year=year)


@router.get("/all", response_model=list[KPIDefinitionRead])
async def list_all_kpis(
    include_inactive: bool = False,
    db: AsyncSession = Depends(get_db),
):
    """List all KPI definitions including inactive (for master data management)."""
    return await kpi_service.list_all_kpis(db, include_inactive=include_inactive)


@router.post("/", response_model=KPIDefinitionRead, status_code=201)
async def create_kpi_definition(
    data: KPIDefinitionCreate,
    db: AsyncSession = Depends(get_db),
):
    existing = await kpi_service.get_kpi_by_code(db, data.code)
    if existing:
        raise HTTPException(status_code=409, detail=f"KPI '{data.code}' already exists")
    return await kpi_service.create_kpi_definition(db, data)


@router.put("/{code}", response_model=KPIDefinitionRead)
async def update_kpi_definition(
    code: str,
    data: KPIDefinitionUpdate,
    db: AsyncSession = Depends(get_db),
):
    result = await kpi_service.update_kpi_definition(db, code, data)
    if not result:
        raise HTTPException(status_code=404, detail=f"KPI '{code}' not found")
    return result


@router.delete("/{code}", status_code=204)
async def delete_kpi_definition(
    code: str,
    db: AsyncSession = Depends(get_db),
):
    deleted = await kpi_service.delete_kpi_definition(db, code)
    if not deleted:
        raise HTTPException(status_code=404, detail=f"KPI '{code}' not found")


# ── Year Management ──


@router.get("/years/available")
async def get_available_years(db: AsyncSession = Depends(get_db)):
    """Get all years with their KPI assignment counts."""
    return await kpi_service.get_available_years(db)


@router.post("/years/{year}/activate")
async def activate_year(year: int, db: AsyncSession = Depends(get_db)):
    """Assign a year to all active KPIs that don't already have it."""
    count = await kpi_service.activate_year(db, year)
    return {"year": year, "kpis_added": count}


@router.post("/years/{year}/deactivate")
async def deactivate_year(year: int, db: AsyncSession = Depends(get_db)):
    """Remove a year from all KPIs."""
    count = await kpi_service.deactivate_year(db, year)
    return {"year": year, "kpis_removed": count}


# ── KPI Values ──


@router.get("/{code}/values", response_model=list[KPIValueRead])
async def get_kpi_values(
    code: str,
    year: int = Query(default_factory=lambda: datetime.now().year),
    db: AsyncSession = Depends(get_db),
):
    kpi = await kpi_service.get_kpi_by_code(db, code)
    if not kpi:
        raise HTTPException(status_code=404, detail=f"KPI '{code}' not found")
    return await kpi_service.get_kpi_values(db, code, year)


@router.post("/{code}/values", response_model=KPIValueRead, status_code=201)
async def create_kpi_value(
    code: str,
    data: KPIValueCreate,
    db: AsyncSession = Depends(get_db),
):
    result = await kpi_service.create_kpi_value(db, code, data)
    if not result:
        raise HTTPException(status_code=404, detail=f"KPI '{code}' not found")
    return result


@router.put("/{code}/values/{value_id}", response_model=KPIValueRead)
async def update_kpi_value(
    code: str,
    value_id: str,
    data: KPIValueUpdate,
    db: AsyncSession = Depends(get_db),
):
    result = await kpi_service.update_kpi_value(db, code, value_id, data)
    if not result:
        raise HTTPException(status_code=404, detail="KPI or value not found")
    return result


@router.delete("/{code}/values/{value_id}", status_code=204)
async def delete_kpi_value(
    code: str,
    value_id: str,
    db: AsyncSession = Depends(get_db),
):
    deleted = await kpi_service.delete_kpi_value(db, code, value_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="KPI or value not found")


@router.get("/{code}/status", response_model=KPIStatusRead)
async def get_kpi_status(code: str, db: AsyncSession = Depends(get_db)):
    result = await kpi_service.get_kpi_status(db, code)
    if not result:
        raise HTTPException(status_code=404, detail=f"KPI '{code}' not found")
    return result
