from decimal import Decimal

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.budget import BudgetItem, BudgetLookup


def _item_to_dict(item: BudgetItem) -> dict:
    """Convert a BudgetItem ORM object to a dict with computed fields."""
    d = {
        "id": item.id,
        "year": item.year,
        "provider": item.provider,
        "managing_team": item.managing_team,
        "concept": item.concept,
        "expense_type": item.expense_type,
        "classification": item.classification,
        "capex_opex": item.capex_opex,
        "cost_center": item.cost_center,
        "previous_year_budget": item.previous_year_budget,
        "previous_year_cost": item.previous_year_cost,
        "monthly_amount": item.monthly_amount,
        "annual_amount": item.annual_amount,
        "status": item.status,
        "delivered": item.delivered,
        "reviewed": item.reviewed,
        "actual_amount": item.actual_amount,
        "invoice_reference": item.invoice_reference,
        "order_reference": item.order_reference,
        "notes": item.notes,
        "created_at": item.created_at,
        "updated_at": item.updated_at,
        "active": item.active,
        "execution_pct": None,
        "deviation": None,
    }
    if item.actual_amount is not None and item.annual_amount and item.annual_amount > 0:
        d["execution_pct"] = round(float(item.actual_amount / item.annual_amount) * 100, 1)
        d["deviation"] = item.actual_amount - item.annual_amount
    return d


# ── Budget Items ──


async def list_budget_items(db: AsyncSession, year: int, include_inactive: bool = False) -> list[dict]:
    stmt = select(BudgetItem).where(BudgetItem.year == year)
    if not include_inactive:
        stmt = stmt.where(BudgetItem.active == True)  # noqa: E712
    stmt = stmt.order_by(BudgetItem.managing_team, BudgetItem.provider)
    result = await db.execute(stmt)
    return [_item_to_dict(item) for item in result.scalars().all()]


async def get_budget_item(db: AsyncSession, item_id: str) -> dict | None:
    result = await db.execute(select(BudgetItem).where(BudgetItem.id == item_id))
    item = result.scalar_one_or_none()
    return _item_to_dict(item) if item else None


async def create_budget_item(db: AsyncSession, data: dict) -> dict:
    item = BudgetItem(**data)
    db.add(item)
    await db.commit()
    await db.refresh(item)
    return _item_to_dict(item)


async def update_budget_item(db: AsyncSession, item_id: str, data: dict) -> dict | None:
    result = await db.execute(select(BudgetItem).where(BudgetItem.id == item_id))
    item = result.scalar_one_or_none()
    if not item:
        return None
    for key, value in data.items():
        if value is not None:
            setattr(item, key, value)
    await db.commit()
    await db.refresh(item)
    return _item_to_dict(item)


async def delete_budget_item(db: AsyncSession, item_id: str) -> bool:
    result = await db.execute(select(BudgetItem).where(BudgetItem.id == item_id))
    item = result.scalar_one_or_none()
    if not item:
        return False
    item.active = False
    await db.commit()
    return True


async def get_budget_summary(db: AsyncSession, year: int) -> dict:
    items = await list_budget_items(db, year)

    total_budget = Decimal(0)
    total_actual = Decimal(0)
    capex_budget = Decimal(0)
    opex_budget = Decimal(0)
    capex_actual = Decimal(0)
    opex_actual = Decimal(0)
    team_map: dict[str, dict] = {}
    status_map: dict[str, int] = {}

    for item in items:
        annual = item["annual_amount"] or Decimal(0)
        actual = item["actual_amount"] or Decimal(0)
        total_budget += annual
        total_actual += actual

        if item["capex_opex"] == "CAPEX":
            capex_budget += annual
            capex_actual += actual
        else:
            opex_budget += annual
            opex_actual += actual

        team = item["managing_team"]
        if team not in team_map:
            team_map[team] = {"team": team, "budget": Decimal(0), "actual": Decimal(0), "items": 0}
        team_map[team]["budget"] += annual
        team_map[team]["actual"] += actual
        team_map[team]["items"] += 1

        status = item["status"]
        status_map[status] = status_map.get(status, 0) + 1

    execution_pct = None
    if total_budget > 0:
        execution_pct = round(float(total_actual / total_budget) * 100, 1)

    return {
        "year": year,
        "total_budget": total_budget,
        "total_actual": total_actual,
        "total_items": len(items),
        "capex_budget": capex_budget,
        "opex_budget": opex_budget,
        "capex_actual": capex_actual,
        "opex_actual": opex_actual,
        "by_team": list(team_map.values()),
        "by_status": status_map,
        "execution_pct": execution_pct,
    }


async def get_available_years(db: AsyncSession) -> list[int]:
    result = await db.execute(
        select(BudgetItem.year).where(BudgetItem.active == True).distinct().order_by(BudgetItem.year)  # noqa: E712
    )
    return [row[0] for row in result.all()]


# ── Budget Lookups ──


async def list_lookups(db: AsyncSession, category: str | None = None, include_inactive: bool = False) -> list[dict]:
    stmt = select(BudgetLookup)
    if category:
        stmt = stmt.where(BudgetLookup.category == category)
    if not include_inactive:
        stmt = stmt.where(BudgetLookup.active == True)  # noqa: E712
    stmt = stmt.order_by(BudgetLookup.category, BudgetLookup.display_order, BudgetLookup.value)
    result = await db.execute(stmt)
    return [
        {
            "id": item.id,
            "category": item.category,
            "value": item.value,
            "display_order": item.display_order,
            "active": item.active,
        }
        for item in result.scalars().all()
    ]


async def create_lookup(db: AsyncSession, data: dict) -> dict:
    item = BudgetLookup(**data)
    db.add(item)
    await db.commit()
    await db.refresh(item)
    return {"id": item.id, "category": item.category, "value": item.value, "display_order": item.display_order, "active": item.active}


async def update_lookup(db: AsyncSession, lookup_id: str, data: dict) -> dict | None:
    result = await db.execute(select(BudgetLookup).where(BudgetLookup.id == lookup_id))
    item = result.scalar_one_or_none()
    if not item:
        return None
    for key, value in data.items():
        if value is not None:
            setattr(item, key, value)
    await db.commit()
    await db.refresh(item)
    return {"id": item.id, "category": item.category, "value": item.value, "display_order": item.display_order, "active": item.active}


async def delete_lookup(db: AsyncSession, lookup_id: str) -> bool:
    result = await db.execute(select(BudgetLookup).where(BudgetLookup.id == lookup_id))
    item = result.scalar_one_or_none()
    if not item:
        return False
    await db.delete(item)
    await db.commit()
    return True
