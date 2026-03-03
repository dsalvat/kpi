import uuid
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.schemas.okr import OKRObjectiveRead, OKRQuarterlyDataRead, OKRQuarterlyDataUpdate
from app.services import okr_service

router = APIRouter(prefix="/api/v1/okrs", tags=["okrs"])


@router.get("/", response_model=list[OKRObjectiveRead])
async def list_okrs(
    year: int = Query(default_factory=lambda: datetime.now().year),
    db: AsyncSession = Depends(get_db),
):
    return await okr_service.list_objectives(db, year)


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


@router.get("/quarterly-review")
async def quarterly_review(
    year: int = Query(default_factory=lambda: datetime.now().year),
    db: AsyncSession = Depends(get_db),
):
    return await okr_service.get_okr_summary(db, year)
