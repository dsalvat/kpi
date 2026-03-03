from datetime import datetime

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.schemas.value import ROIRead, ValueSummaryRead
from app.services import value_service

router = APIRouter(prefix="/api/v1/value", tags=["value"])


@router.get("/", response_model=ValueSummaryRead)
async def get_value_summary(
    year: int = Query(default_factory=lambda: datetime.now().year),
    db: AsyncSession = Depends(get_db),
):
    return await value_service.get_value_summary(db, year)


@router.get("/roi", response_model=ROIRead)
async def get_roi(
    year: int = Query(default_factory=lambda: datetime.now().year),
    db: AsyncSession = Depends(get_db),
):
    return await value_service.get_roi(db, year)
