from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth import verify_n8n_token
from app.database import get_db
from app.schemas.ingest import IngestBatchPayload, IngestLogRead, KPIIngestPayload
from app.services import ingest_service

router = APIRouter(prefix="/api/v1/ingest", tags=["ingest"])


@router.post("/kpi-value", dependencies=[Depends(verify_n8n_token)])
async def ingest_kpi_value(
    payload: KPIIngestPayload,
    db: AsyncSession = Depends(get_db),
):
    result = await ingest_service.ingest_kpi_value(db, payload)
    if not result:
        return {"status": "error", "message": f"KPI '{payload.kpi_code}' not found"}
    return {"status": "ok", "value_id": str(result.id)}


@router.post("/batch", dependencies=[Depends(verify_n8n_token)])
async def ingest_batch(
    payload: IngestBatchPayload,
    db: AsyncSession = Depends(get_db),
):
    return await ingest_service.ingest_batch(db, payload.items, payload.workflow_id)


@router.get("/logs", response_model=list[IngestLogRead])
async def get_sync_logs(db: AsyncSession = Depends(get_db)):
    return await ingest_service.get_sync_logs(db)
