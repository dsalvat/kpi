import json

from sqlalchemy.ext.asyncio import AsyncSession

from app.cache import get_cached, set_cached
from app.schemas.dashboard import DashboardRead
from app.services import kpi_service, okr_service, project_service, value_service


async def get_dashboard(db: AsyncSession, year: int) -> dict:
    # Check Redis cache
    cache_key = f"dashboard:{year}"
    cached = await get_cached(cache_key)
    if cached:
        return json.loads(cached)

    # Aggregate from all services
    kpis = await kpi_service.list_kpis(db, year=year)
    projects = await project_service.get_projects_summary(db)
    okr = await okr_service.get_okr_summary(db, year)
    value = await value_service.get_value_summary(db, year)

    dashboard = {
        "year": year,
        "kpi_summary": kpis,
        "projects_summary": projects,
        "okr_summary": okr,
        "value_summary": value,
        "recent_updates": [],
    }

    # Cache for 5 minutes
    try:
        serialized = DashboardRead.model_validate(dashboard).model_dump_json()
        await set_cached(cache_key, serialized, ttl=300)
    except Exception:
        pass  # Cache failure shouldn't break the dashboard

    return dashboard
