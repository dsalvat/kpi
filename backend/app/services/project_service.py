from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.project import Project
from app.schemas.project import ProjectCreate, ProjectUpdate


async def list_projects(db: AsyncSession) -> list[Project]:
    stmt = select(Project).order_by(Project.code)
    result = await db.execute(stmt)
    return list(result.scalars().all())


async def get_project_by_code(db: AsyncSession, code: str) -> Project | None:
    stmt = select(Project).where(Project.code == code)
    result = await db.execute(stmt)
    return result.scalar_one_or_none()


async def create_project(db: AsyncSession, data: ProjectCreate) -> Project:
    project = Project(**data.model_dump())
    db.add(project)
    await db.commit()
    await db.refresh(project)
    return project


async def update_project(db: AsyncSession, code: str, data: ProjectUpdate) -> Project | None:
    project = await get_project_by_code(db, code)
    if not project:
        return None
    update_data = data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(project, field, value)
    await db.commit()
    await db.refresh(project)
    return project


async def delete_project(db: AsyncSession, code: str) -> bool:
    project = await get_project_by_code(db, code)
    if not project:
        return False
    await db.delete(project)
    await db.commit()
    return True


async def get_projects_summary(db: AsyncSession) -> dict:
    projects = await list_projects(db)
    total = len(projects)
    active = sum(1 for p in projects if p.status == "active")
    at_risk = sum(1 for p in projects if p.status == "at_risk")
    completed = sum(1 for p in projects if p.status == "completed")
    blocked = sum(1 for p in projects if p.status == "blocked")
    completions = [p.completion_pct for p in projects if p.completion_pct is not None]
    avg_completion = sum(completions) / len(completions) if completions else None
    return {
        "total": total,
        "active": active,
        "at_risk": at_risk,
        "completed": completed,
        "blocked": blocked,
        "avg_completion_pct": avg_completion,
    }
