import uuid

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.schemas.organization import (
    AreaCreate,
    AreaRead,
    AreaUpdate,
    CompanyCreate,
    CompanyRead,
    CompanyUpdate,
    DepartmentCreate,
    DepartmentRead,
    DepartmentUpdate,
    MemberCreate,
    MemberRead,
    MemberSummary,
    MemberUpdate,
    TeamCreate,
    TeamRead,
    TeamSummary,
    TeamUpdate,
)
from app.services import organization_service as svc

router = APIRouter(prefix="/api/v1/organization", tags=["organization"])


# ══════════ Companies ══════════

@router.get("/companies/", response_model=list[CompanyRead])
async def list_companies(db: AsyncSession = Depends(get_db)):
    return await svc.list_companies(db)


@router.post("/companies/", response_model=CompanyRead, status_code=201)
async def create_company(data: CompanyCreate, db: AsyncSession = Depends(get_db)):
    existing = await svc.get_company_by_slug(db, data.slug)
    if existing:
        raise HTTPException(409, f"Company slug '{data.slug}' already exists")
    return await svc.create_company(db, data)


@router.put("/companies/{company_id}", response_model=CompanyRead)
async def update_company(company_id: uuid.UUID, data: CompanyUpdate, db: AsyncSession = Depends(get_db)):
    result = await svc.update_company(db, company_id, data)
    if not result:
        raise HTTPException(404, "Company not found")
    return result


@router.delete("/companies/{company_id}", status_code=204)
async def delete_company(company_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    if not await svc.delete_company(db, company_id):
        raise HTTPException(404, "Company not found")


# ══════════ Departments ══════════

@router.get("/companies/{company_id}/departments/", response_model=list[DepartmentRead])
async def list_departments(company_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    return await svc.list_departments(db, company_id)


@router.post("/companies/{company_id}/departments/", response_model=DepartmentRead, status_code=201)
async def create_department(
    company_id: uuid.UUID, data: DepartmentCreate, db: AsyncSession = Depends(get_db)
):
    return await svc.create_department(db, company_id, data)


@router.put("/departments/{dept_id}", response_model=DepartmentRead)
async def update_department(dept_id: uuid.UUID, data: DepartmentUpdate, db: AsyncSession = Depends(get_db)):
    result = await svc.update_department(db, dept_id, data)
    if not result:
        raise HTTPException(404, "Department not found")
    return result


@router.delete("/departments/{dept_id}", status_code=204)
async def delete_department(dept_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    if not await svc.delete_department(db, dept_id):
        raise HTTPException(404, "Department not found")


# ══════════ Areas ══════════

@router.post("/areas/", response_model=AreaRead, status_code=201)
async def create_area(data: AreaCreate, db: AsyncSession = Depends(get_db)):
    return await svc.create_area(db, data)


@router.put("/areas/{area_id}", response_model=AreaRead)
async def update_area(area_id: uuid.UUID, data: AreaUpdate, db: AsyncSession = Depends(get_db)):
    result = await svc.update_area(db, area_id, data)
    if not result:
        raise HTTPException(404, "Area not found")
    return result


@router.delete("/areas/{area_id}", status_code=204)
async def delete_area(area_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    if not await svc.delete_area(db, area_id):
        raise HTTPException(404, "Area not found")


# ══════════ Teams ══════════

@router.post("/teams/", response_model=TeamRead, status_code=201)
async def create_team(data: TeamCreate, db: AsyncSession = Depends(get_db)):
    return await svc.create_team(db, data)


@router.put("/teams/{team_id}", response_model=TeamRead)
async def update_team(team_id: uuid.UUID, data: TeamUpdate, db: AsyncSession = Depends(get_db)):
    result = await svc.update_team(db, team_id, data)
    if not result:
        raise HTTPException(404, "Team not found")
    return result


@router.delete("/teams/{team_id}", status_code=204)
async def delete_team(team_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    if not await svc.delete_team(db, team_id):
        raise HTTPException(404, "Team not found")


# ══════════ Members ══════════

@router.get("/companies/{company_id}/members/", response_model=list[MemberRead])
async def list_members(
    company_id: uuid.UUID,
    team_id: uuid.UUID | None = None,
    unassigned: bool = False,
    db: AsyncSession = Depends(get_db),
):
    return await svc.list_members(db, company_id, team_id, unassigned)


@router.get("/companies/{company_id}/members/summary", response_model=list[MemberSummary])
async def list_members_summary(company_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    members = await svc.list_members(db, company_id)
    return members


@router.post("/companies/{company_id}/members/", response_model=MemberRead, status_code=201)
async def create_member(
    company_id: uuid.UUID, data: MemberCreate, db: AsyncSession = Depends(get_db)
):
    existing = await svc.get_member_by_email(db, company_id, data.email)
    if existing:
        raise HTTPException(409, f"Member with email '{data.email}' already exists")
    return await svc.create_member(db, company_id, data)


@router.put("/members/{member_id}", response_model=MemberRead)
async def update_member(member_id: uuid.UUID, data: MemberUpdate, db: AsyncSession = Depends(get_db)):
    result = await svc.update_member(db, member_id, data)
    if not result:
        raise HTTPException(404, "Member not found")
    return result


@router.delete("/members/{member_id}", status_code=204)
async def delete_member(member_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    if not await svc.delete_member(db, member_id):
        raise HTTPException(404, "Member not found")


# ══════════ Summaries for dropdowns ══════════

@router.get("/companies/{company_id}/teams/summary", response_model=list[TeamSummary])
async def list_teams_summary(company_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    """All teams across all departments/areas for a company, for dropdowns."""
    from sqlalchemy import select

    from app.models.organization import Area, Department, Team
    stmt = (
        select(Team)
        .join(Area)
        .join(Department)
        .where(Department.company_id == company_id)
        .order_by(Team.code)
    )
    result = await db.execute(stmt)
    return list(result.scalars().all())
