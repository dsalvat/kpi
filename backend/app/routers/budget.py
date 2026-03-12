from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.schemas.budget import (
    BudgetItemCreate,
    BudgetItemRead,
    BudgetItemUpdate,
    BudgetLookupCreate,
    BudgetLookupRead,
    BudgetLookupUpdate,
    BudgetSummaryRead,
)
from app.services import budget_service

router = APIRouter(prefix="/api/v1/budget", tags=["budget"])


# ── Budget Items (list endpoints first) ──


@router.get("/", response_model=list[BudgetItemRead])
async def list_items(
    year: int = Query(..., description="Budget year"),
    include_inactive: bool = Query(False),
    db: AsyncSession = Depends(get_db),
):
    return await budget_service.list_budget_items(db, year, include_inactive)


@router.get("/summary/", response_model=BudgetSummaryRead)
async def get_summary(
    year: int = Query(..., description="Budget year"),
    db: AsyncSession = Depends(get_db),
):
    return await budget_service.get_budget_summary(db, year)


@router.get("/years/")
async def get_years(db: AsyncSession = Depends(get_db)):
    years = await budget_service.get_available_years(db)
    return {"years": years}


# ── Budget Lookups (before {item_id} to avoid route conflicts) ──


@router.get("/lookups/", response_model=list[BudgetLookupRead])
async def list_lookups(
    category: str | None = Query(None, description="Filter: team, expense_type, classification, cost_center"),
    include_inactive: bool = Query(False),
    db: AsyncSession = Depends(get_db),
):
    return await budget_service.list_lookups(db, category, include_inactive)


@router.post("/lookups/", response_model=BudgetLookupRead, status_code=201)
async def create_lookup(
    payload: BudgetLookupCreate,
    db: AsyncSession = Depends(get_db),
):
    return await budget_service.create_lookup(db, payload.model_dump())


@router.put("/lookups/{lookup_id}/", response_model=BudgetLookupRead)
async def update_lookup(
    lookup_id: str,
    payload: BudgetLookupUpdate,
    db: AsyncSession = Depends(get_db),
):
    data = payload.model_dump(exclude_unset=True)
    item = await budget_service.update_lookup(db, lookup_id, data)
    if not item:
        raise HTTPException(status_code=404, detail="Lookup not found")
    return item


@router.delete("/lookups/{lookup_id}/", status_code=204)
async def delete_lookup(lookup_id: str, db: AsyncSession = Depends(get_db)):
    deleted = await budget_service.delete_lookup(db, lookup_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Lookup not found")


# ── Budget Items (parameterized routes last) ──


@router.get("/{item_id}/", response_model=BudgetItemRead)
async def get_item(item_id: str, db: AsyncSession = Depends(get_db)):
    item = await budget_service.get_budget_item(db, item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Budget item not found")
    return item


@router.post("/", response_model=BudgetItemRead, status_code=201)
async def create_item(
    payload: BudgetItemCreate,
    db: AsyncSession = Depends(get_db),
):
    return await budget_service.create_budget_item(db, payload.model_dump())


@router.put("/{item_id}/", response_model=BudgetItemRead)
async def update_item(
    item_id: str,
    payload: BudgetItemUpdate,
    db: AsyncSession = Depends(get_db),
):
    data = payload.model_dump(exclude_unset=True)
    item = await budget_service.update_budget_item(db, item_id, data)
    if not item:
        raise HTTPException(status_code=404, detail="Budget item not found")
    return item


@router.delete("/{item_id}/", status_code=204)
async def delete_item(item_id: str, db: AsyncSession = Depends(get_db)):
    deleted = await budget_service.delete_budget_item(db, item_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Budget item not found")
