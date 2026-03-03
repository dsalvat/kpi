from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.value import ValueItem
from app.services.calculations import blue_money_item, global_roi, green_money_item


async def get_value_items(db: AsyncSession, year: int) -> list[ValueItem]:
    stmt = select(ValueItem).where(ValueItem.year == year).order_by(ValueItem.code)
    result = await db.execute(stmt)
    return list(result.scalars().all())


async def get_value_summary(db: AsyncSession, year: int) -> dict:
    items = await get_value_items(db, year)

    blue_items = []
    green_items = []
    blue_total = 0.0
    green_total = 0.0

    for item in items:
        if item.type == "blue_money":
            computed = blue_money_item(
                float(item.hours_saved_annual) if item.hours_saved_annual else None,
                float(item.hourly_rate_eur) if item.hourly_rate_eur else None,
                float(item.operational_savings_eur) if item.operational_savings_eur else None,
                float(item.direct_savings_eur) if item.direct_savings_eur else None,
            )
            blue_total += computed
            blue_items.append({**_item_to_dict(item), "computed_value": computed})
        elif item.type == "green_money":
            computed = green_money_item(
                float(item.revenues_enabled_eur) if item.revenues_enabled_eur else None,
                float(item.commercial_savings_eur) if item.commercial_savings_eur else None,
                float(item.it_attribution_pct) if item.it_attribution_pct else None,
            )
            green_total += computed
            green_items.append({**_item_to_dict(item), "computed_value": computed})

    return {
        "year": year,
        "blue_money_total": blue_total,
        "green_money_total": green_total,
        "blue_items": blue_items,
        "green_items": green_items,
    }


async def get_roi(db: AsyncSession, year: int) -> dict:
    summary = await get_value_summary(db, year)
    # Total investment = sum of project budgets (simplified for MVP)
    total_investment = None  # Will be populated from projects in future
    roi = global_roi(summary["blue_money_total"], summary["green_money_total"], total_investment)
    return {
        "year": year,
        "blue_total": summary["blue_money_total"],
        "green_total": summary["green_money_total"],
        "total_value": summary["blue_money_total"] + summary["green_money_total"],
        "total_investment": total_investment,
        "roi": roi,
    }


def _item_to_dict(item: ValueItem) -> dict:
    return {
        "id": item.id,
        "project_id": item.project_id,
        "type": item.type,
        "code": item.code,
        "initiative": item.initiative,
        "hours_saved_annual": item.hours_saved_annual,
        "hourly_rate_eur": item.hourly_rate_eur,
        "operational_savings_eur": item.operational_savings_eur,
        "direct_savings_eur": item.direct_savings_eur,
        "revenues_enabled_eur": item.revenues_enabled_eur,
        "commercial_savings_eur": item.commercial_savings_eur,
        "it_attribution_pct": item.it_attribution_pct,
        "year": item.year,
    }
