from datetime import datetime

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.services import dashboard_service

router = APIRouter(prefix="/api/v1/dashboard", tags=["dashboard"])


@router.get("/")
async def get_dashboard(
    year: int = Query(default_factory=lambda: datetime.now().year),
    db: AsyncSession = Depends(get_db),
):
    return await dashboard_service.get_dashboard(db, year)


@router.get("/year/{year}")
async def get_dashboard_by_year(
    year: int,
    db: AsyncSession = Depends(get_db),
):
    return await dashboard_service.get_dashboard(db, year)
