from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.schemas.project import ProjectCreate, ProjectRead, ProjectUpdate
from app.services import project_service

router = APIRouter(prefix="/api/v1/projects", tags=["projects"])


@router.get("/", response_model=list[ProjectRead])
async def list_projects(db: AsyncSession = Depends(get_db)):
    return await project_service.list_projects(db)


@router.post("/", response_model=ProjectRead, status_code=201)
async def create_project(
    data: ProjectCreate,
    db: AsyncSession = Depends(get_db),
):
    existing = await project_service.get_project_by_code(db, data.code)
    if existing:
        raise HTTPException(status_code=409, detail=f"Project '{data.code}' already exists")
    return await project_service.create_project(db, data)


@router.put("/{code}", response_model=ProjectRead)
async def update_project(
    code: str,
    data: ProjectUpdate,
    db: AsyncSession = Depends(get_db),
):
    result = await project_service.update_project(db, code, data)
    if not result:
        raise HTTPException(status_code=404, detail=f"Project '{code}' not found")
    return result


@router.delete("/{code}", status_code=204)
async def delete_project(
    code: str,
    db: AsyncSession = Depends(get_db),
):
    deleted = await project_service.delete_project(db, code)
    if not deleted:
        raise HTTPException(status_code=404, detail=f"Project '{code}' not found")
