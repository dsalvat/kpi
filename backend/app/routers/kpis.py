from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.schemas.kpi import KPIDefinitionRead, KPIStatusRead, KPIValueCreate, KPIValueRead
from app.services import kpi_service

router = APIRouter(prefix="/api/v1/kpis", tags=["kpis"])


@router.get("/", response_model=list[KPIDefinitionRead])
async def list_kpis(
    category: str | None = None,
    year: int | None = None,
    db: AsyncSession = Depends(get_db),
):
    return await kpi_service.list_kpis(db, category=category, year=year)


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


@router.get("/{code}/status", response_model=KPIStatusRead)
async def get_kpi_status(code: str, db: AsyncSession = Depends(get_db)):
    result = await kpi_service.get_kpi_status(db, code)
    if not result:
        raise HTTPException(status_code=404, detail=f"KPI '{code}' not found")
    return result
