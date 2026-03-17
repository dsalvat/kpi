import uuid

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.schemas.process import (
    ProcessDocumentCreate,
    ProcessDocumentRead,
    ProcessDocumentSummary,
    ProcessDocumentUpdate,
    ProcessLabelCreate,
    ProcessLabelRead,
    ProcessLabelUpdate,
)
from app.services import process_service as svc

router = APIRouter(prefix="/api/v1/processes", tags=["processes"])


# ══════════ Labels ══════════

@router.get("/companies/{company_id}/labels/", response_model=list[ProcessLabelRead])
async def list_labels(company_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    return await svc.list_labels(db, company_id)


@router.post("/companies/{company_id}/labels/", response_model=ProcessLabelRead, status_code=201)
async def create_label(
    company_id: uuid.UUID, data: ProcessLabelCreate, db: AsyncSession = Depends(get_db)
):
    return await svc.create_label(db, company_id, data)


@router.put("/labels/{label_id}", response_model=ProcessLabelRead)
async def update_label(label_id: uuid.UUID, data: ProcessLabelUpdate, db: AsyncSession = Depends(get_db)):
    result = await svc.update_label(db, label_id, data)
    if not result:
        raise HTTPException(404, "Label not found")
    return result


@router.delete("/labels/{label_id}", status_code=204)
async def delete_label(label_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    if not await svc.delete_label(db, label_id):
        raise HTTPException(404, "Label not found")


# ══════════ Documents ══════════

@router.get("/companies/{company_id}/documents/", response_model=list[ProcessDocumentSummary])
async def list_documents(
    company_id: uuid.UUID,
    label_id: uuid.UUID | None = None,
    include_inactive: bool = False,
    db: AsyncSession = Depends(get_db),
):
    return await svc.list_documents(db, company_id, label_id, include_inactive)


@router.get("/documents/{document_id}", response_model=ProcessDocumentRead)
async def get_document(document_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    doc = await svc.get_document(db, document_id)
    if not doc:
        raise HTTPException(404, "Document not found")
    return doc


@router.post("/companies/{company_id}/documents/", response_model=ProcessDocumentRead, status_code=201)
async def create_document(
    company_id: uuid.UUID, data: ProcessDocumentCreate, db: AsyncSession = Depends(get_db)
):
    return await svc.create_document(db, company_id, data)


@router.put("/documents/{document_id}", response_model=ProcessDocumentRead)
async def update_document(
    document_id: uuid.UUID, data: ProcessDocumentUpdate, db: AsyncSession = Depends(get_db)
):
    result = await svc.update_document(db, document_id, data)
    if not result:
        raise HTTPException(404, "Document not found")
    return result


@router.delete("/documents/{document_id}", status_code=204)
async def delete_document(document_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    if not await svc.delete_document(db, document_id):
        raise HTTPException(404, "Document not found")
