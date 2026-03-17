import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict


# ── Labels ──

class ProcessLabelCreate(BaseModel):
    name: str
    color: str | None = None


class ProcessLabelUpdate(BaseModel):
    name: str | None = None
    color: str | None = None
    active: bool | None = None


class ProcessLabelRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    company_id: uuid.UUID
    name: str
    color: str | None
    active: bool


# ── Documents ──

class ProcessDocumentCreate(BaseModel):
    title: str
    content: str = ""
    created_by: str | None = None
    label_ids: list[uuid.UUID] = []


class ProcessDocumentUpdate(BaseModel):
    title: str | None = None
    content: str | None = None
    label_ids: list[uuid.UUID] | None = None
    active: bool | None = None


class ProcessDocumentRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    company_id: uuid.UUID
    title: str
    content: str
    created_by: str | None
    created_at: datetime
    updated_at: datetime
    active: bool
    labels: list[ProcessLabelRead]


class ProcessDocumentSummary(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    title: str
    created_by: str | None
    created_at: datetime
    updated_at: datetime
    active: bool
    labels: list[ProcessLabelRead]
