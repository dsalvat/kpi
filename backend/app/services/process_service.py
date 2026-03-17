import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.process import ProcessDocument, ProcessLabel, process_document_labels
from app.schemas.process import (
    ProcessDocumentCreate,
    ProcessDocumentUpdate,
    ProcessLabelCreate,
    ProcessLabelUpdate,
)


# ── Labels ──

async def list_labels(db: AsyncSession, company_id: uuid.UUID) -> list[ProcessLabel]:
    stmt = (
        select(ProcessLabel)
        .where(ProcessLabel.company_id == company_id)
        .order_by(ProcessLabel.name)
    )
    result = await db.execute(stmt)
    return list(result.scalars().all())


async def get_label(db: AsyncSession, label_id: uuid.UUID) -> ProcessLabel | None:
    return await db.get(ProcessLabel, label_id)


async def create_label(db: AsyncSession, company_id: uuid.UUID, data: ProcessLabelCreate) -> ProcessLabel:
    label = ProcessLabel(company_id=company_id, **data.model_dump())
    db.add(label)
    await db.commit()
    await db.refresh(label)
    return label


async def update_label(db: AsyncSession, label_id: uuid.UUID, data: ProcessLabelUpdate) -> ProcessLabel | None:
    label = await get_label(db, label_id)
    if not label:
        return None
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(label, field, value)
    await db.commit()
    await db.refresh(label)
    return label


async def delete_label(db: AsyncSession, label_id: uuid.UUID) -> bool:
    label = await get_label(db, label_id)
    if not label:
        return False
    await db.delete(label)
    await db.commit()
    return True


# ── Documents ──

def _doc_load_options():
    return [selectinload(ProcessDocument.labels)]


async def list_documents(
    db: AsyncSession,
    company_id: uuid.UUID,
    label_id: uuid.UUID | None = None,
    include_inactive: bool = False,
) -> list[ProcessDocument]:
    stmt = (
        select(ProcessDocument)
        .where(ProcessDocument.company_id == company_id)
        .options(*_doc_load_options())
    )
    if not include_inactive:
        stmt = stmt.where(ProcessDocument.active.is_(True))
    if label_id:
        stmt = stmt.join(process_document_labels).where(
            process_document_labels.c.label_id == label_id
        )
    stmt = stmt.order_by(ProcessDocument.updated_at.desc())
    result = await db.execute(stmt)
    return list(result.scalars().unique().all())


async def get_document(db: AsyncSession, document_id: uuid.UUID) -> ProcessDocument | None:
    stmt = (
        select(ProcessDocument)
        .where(ProcessDocument.id == document_id)
        .options(*_doc_load_options())
    )
    result = await db.execute(stmt)
    return result.scalar_one_or_none()


async def create_document(
    db: AsyncSession, company_id: uuid.UUID, data: ProcessDocumentCreate
) -> ProcessDocument:
    doc = ProcessDocument(
        company_id=company_id,
        title=data.title,
        content=data.content,
        created_by=data.created_by,
    )
    if data.label_ids:
        labels = await _resolve_labels(db, data.label_ids)
        doc.labels = labels
    db.add(doc)
    await db.commit()
    # Reload with relationships
    stmt = select(ProcessDocument).where(ProcessDocument.id == doc.id).options(*_doc_load_options())
    result = await db.execute(stmt)
    return result.scalar_one()


async def update_document(
    db: AsyncSession, document_id: uuid.UUID, data: ProcessDocumentUpdate
) -> ProcessDocument | None:
    doc = await get_document(db, document_id)
    if not doc:
        return None
    update_data = data.model_dump(exclude_unset=True)
    label_ids = update_data.pop("label_ids", None)
    for field, value in update_data.items():
        setattr(doc, field, value)
    if label_ids is not None:
        doc.labels = await _resolve_labels(db, label_ids)
    await db.commit()
    stmt = select(ProcessDocument).where(ProcessDocument.id == document_id).options(*_doc_load_options())
    result = await db.execute(stmt)
    return result.scalar_one()


async def delete_document(db: AsyncSession, document_id: uuid.UUID) -> bool:
    doc = await db.get(ProcessDocument, document_id)
    if not doc:
        return False
    await db.delete(doc)
    await db.commit()
    return True


async def _resolve_labels(db: AsyncSession, label_ids: list[uuid.UUID]) -> list[ProcessLabel]:
    if not label_ids:
        return []
    stmt = select(ProcessLabel).where(ProcessLabel.id.in_(label_ids))
    result = await db.execute(stmt)
    return list(result.scalars().all())
