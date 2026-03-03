from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.schemas.project import ProjectRead, ProjectUpdate
from app.services import project_service

router = APIRouter(prefix="/api/v1/projects", tags=["projects"])


@router.get("/", response_model=list[ProjectRead])
async def list_projects(db: AsyncSession = Depends(get_db)):
    return await project_service.list_projects(db)


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
