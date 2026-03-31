import uuid
from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel


class KPIIngestPayload(BaseModel):
    kpi_code: str
    year: int
    month: int = 0
    week: int | None = None
    value: Decimal
    notes: str | None = None
    workflow_id: str | None = None


class IngestBatchPayload(BaseModel):
    items: list[KPIIngestPayload]
    workflow_id: str | None = None


class IngestLogRead(BaseModel):
    id: uuid.UUID
    workflow_id: str
    status: str
    kpis_collected: int
    error_message: str | None = None
    started_at: datetime
    finished_at: datetime | None = None

    model_config = {"from_attributes": True}
