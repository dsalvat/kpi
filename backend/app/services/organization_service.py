import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.organization import Company, Department, Area, Team, Member
from app.schemas.organization import (
    CompanyCreate, CompanyUpdate,
    DepartmentCreate, DepartmentUpdate,
    AreaCreate, AreaUpdate,
    TeamCreate, TeamUpdate,
    MemberCreate, MemberUpdate,
)


# ── Company ──

async def list_companies(db: AsyncSession) -> list[Company]:
    result = await db.execute(select(Company).order_by(Company.name))
    return list(result.scalars().all())


async def get_company(db: AsyncSession, company_id: uuid.UUID) -> Company | None:
    return await db.get(Company, company_id)


async def get_company_by_slug(db: AsyncSession, slug: str) -> Company | None:
    result = await db.execute(select(Company).where(Company.slug == slug))
    return result.scalar_one_or_none()


async def create_company(db: AsyncSession, data: CompanyCreate) -> Company:
    company = Company(**data.model_dump())
    db.add(company)
    await db.commit()
    await db.refresh(company)
    return company


async def update_company(db: AsyncSession, company_id: uuid.UUID, data: CompanyUpdate) -> Company | None:
    company = await get_company(db, company_id)
    if not company:
        return None
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(company, field, value)
    await db.commit()
    await db.refresh(company)
    return company


# ── Department ──

async def list_departments(db: AsyncSession, company_id: uuid.UUID) -> list[Department]:
    stmt = (
        select(Department)
        .where(Department.company_id == company_id)
        .options(
            selectinload(Department.director),
            selectinload(Department.areas)
            .selectinload(Area.responsable),
            selectinload(Department.areas)
            .selectinload(Area.teams)
            .selectinload(Team.coordinador),
            selectinload(Department.areas)
            .selectinload(Area.teams)
            .selectinload(Team.members),
        )
        .order_by(Department.code)
    )
    result = await db.execute(stmt)
    return list(result.scalars().all())


async def get_department(db: AsyncSession, dept_id: uuid.UUID) -> Department | None:
    return await db.get(Department, dept_id)


async def create_department(db: AsyncSession, company_id: uuid.UUID, data: DepartmentCreate) -> Department:
    dept = Department(company_id=company_id, **data.model_dump())
    db.add(dept)
    await db.commit()
    await db.refresh(dept)
    return dept


async def update_department(db: AsyncSession, dept_id: uuid.UUID, data: DepartmentUpdate) -> Department | None:
    dept = await get_department(db, dept_id)
    if not dept:
        return None
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(dept, field, value)
    await db.commit()
    await db.refresh(dept)
    return dept


async def delete_department(db: AsyncSession, dept_id: uuid.UUID) -> bool:
    dept = await get_department(db, dept_id)
    if not dept:
        return False
    await db.delete(dept)
    await db.commit()
    return True


# ── Area ──

async def get_area(db: AsyncSession, area_id: uuid.UUID) -> Area | None:
    return await db.get(Area, area_id)


async def create_area(db: AsyncSession, data: AreaCreate) -> Area:
    area = Area(**data.model_dump())
    db.add(area)
    await db.commit()
    await db.refresh(area)
    return area


async def update_area(db: AsyncSession, area_id: uuid.UUID, data: AreaUpdate) -> Area | None:
    area = await get_area(db, area_id)
    if not area:
        return None
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(area, field, value)
    await db.commit()
    await db.refresh(area)
    return area


async def delete_area(db: AsyncSession, area_id: uuid.UUID) -> bool:
    area = await get_area(db, area_id)
    if not area:
        return False
    await db.delete(area)
    await db.commit()
    return True


# ── Team ──

async def get_team(db: AsyncSession, team_id: uuid.UUID) -> Team | None:
    return await db.get(Team, team_id)


async def create_team(db: AsyncSession, data: TeamCreate) -> Team:
    team = Team(**data.model_dump())
    db.add(team)
    await db.commit()
    await db.refresh(team)
    return team


async def update_team(db: AsyncSession, team_id: uuid.UUID, data: TeamUpdate) -> Team | None:
    team = await get_team(db, team_id)
    if not team:
        return None
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(team, field, value)
    await db.commit()
    await db.refresh(team)
    return team


async def delete_team(db: AsyncSession, team_id: uuid.UUID) -> bool:
    team = await get_team(db, team_id)
    if not team:
        return False
    await db.delete(team)
    await db.commit()
    return True


# ── Member ──

async def list_members(db: AsyncSession, company_id: uuid.UUID, team_id: uuid.UUID | None = None) -> list[Member]:
    stmt = select(Member).where(Member.company_id == company_id)
    if team_id:
        stmt = stmt.where(Member.team_id == team_id)
    stmt = stmt.order_by(Member.last_name, Member.first_name)
    result = await db.execute(stmt)
    return list(result.scalars().all())


async def get_member(db: AsyncSession, member_id: uuid.UUID) -> Member | None:
    return await db.get(Member, member_id)


async def get_member_by_email(db: AsyncSession, company_id: uuid.UUID, email: str) -> Member | None:
    stmt = select(Member).where(Member.company_id == company_id, Member.email == email)
    result = await db.execute(stmt)
    return result.scalar_one_or_none()


async def create_member(db: AsyncSession, company_id: uuid.UUID, data: MemberCreate) -> Member:
    member = Member(company_id=company_id, **data.model_dump())
    db.add(member)
    await db.commit()
    await db.refresh(member)
    return member


async def update_member(db: AsyncSession, member_id: uuid.UUID, data: MemberUpdate) -> Member | None:
    member = await get_member(db, member_id)
    if not member:
        return None
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(member, field, value)
    await db.commit()
    await db.refresh(member)
    return member


async def delete_member(db: AsyncSession, member_id: uuid.UUID) -> bool:
    member = await get_member(db, member_id)
    if not member:
        return False
    await db.delete(member)
    await db.commit()
    return True
