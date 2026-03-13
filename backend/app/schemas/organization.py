import uuid

from pydantic import BaseModel


# ── Company ──

class CompanyRead(BaseModel):
    id: uuid.UUID
    name: str
    slug: str
    active: bool

    model_config = {"from_attributes": True}


class CompanyCreate(BaseModel):
    name: str
    slug: str


class CompanyUpdate(BaseModel):
    name: str | None = None
    slug: str | None = None
    active: bool | None = None


# ── Member (defined early, referenced by others) ──

class MemberRead(BaseModel):
    id: uuid.UUID
    company_id: uuid.UUID
    team_id: uuid.UUID
    first_name: str
    last_name: str
    email: str
    position: str | None = None
    role: str
    active: bool

    model_config = {"from_attributes": True}


class MemberCreate(BaseModel):
    team_id: uuid.UUID
    first_name: str
    last_name: str
    email: str
    position: str | None = None
    role: str = "membre"


class MemberUpdate(BaseModel):
    team_id: uuid.UUID | None = None
    first_name: str | None = None
    last_name: str | None = None
    email: str | None = None
    position: str | None = None
    role: str | None = None
    active: bool | None = None


# ── Team ──

class TeamRead(BaseModel):
    id: uuid.UUID
    area_id: uuid.UUID
    name: str
    code: str
    description: str | None = None
    coordinador_id: uuid.UUID | None = None
    coordinador: MemberRead | None = None
    active: bool
    members: list[MemberRead] = []

    model_config = {"from_attributes": True}


class TeamCreate(BaseModel):
    area_id: uuid.UUID
    name: str
    code: str
    description: str | None = None
    coordinador_id: uuid.UUID | None = None


class TeamUpdate(BaseModel):
    name: str | None = None
    code: str | None = None
    description: str | None = None
    coordinador_id: uuid.UUID | None = None
    active: bool | None = None


# ── Area ──

class AreaRead(BaseModel):
    id: uuid.UUID
    department_id: uuid.UUID
    name: str
    code: str
    description: str | None = None
    responsable_id: uuid.UUID | None = None
    responsable: MemberRead | None = None
    active: bool
    teams: list[TeamRead] = []

    model_config = {"from_attributes": True}


class AreaCreate(BaseModel):
    department_id: uuid.UUID
    name: str
    code: str
    description: str | None = None
    responsable_id: uuid.UUID | None = None


class AreaUpdate(BaseModel):
    name: str | None = None
    code: str | None = None
    description: str | None = None
    responsable_id: uuid.UUID | None = None
    active: bool | None = None


# ── Department ──

class DepartmentRead(BaseModel):
    id: uuid.UUID
    company_id: uuid.UUID
    name: str
    code: str
    description: str | None = None
    director_id: uuid.UUID | None = None
    director: MemberRead | None = None
    active: bool
    areas: list[AreaRead] = []

    model_config = {"from_attributes": True}


class DepartmentCreate(BaseModel):
    name: str
    code: str
    description: str | None = None
    director_id: uuid.UUID | None = None


class DepartmentUpdate(BaseModel):
    name: str | None = None
    code: str | None = None
    description: str | None = None
    director_id: uuid.UUID | None = None
    active: bool | None = None


# ── Summary for dropdowns ──

class MemberSummary(BaseModel):
    id: uuid.UUID
    first_name: str
    last_name: str
    role: str
    team_id: uuid.UUID

    model_config = {"from_attributes": True}


class TeamSummary(BaseModel):
    id: uuid.UUID
    name: str
    code: str
    area_id: uuid.UUID

    model_config = {"from_attributes": True}
