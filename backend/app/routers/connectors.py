from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.schemas.connector import (
    ConnectorCreate,
    ConnectorRead,
    ConnectorSummary,
    ConnectorUpdate,
    CredentialCreate,
    CredentialRead,
    CredentialSummary,
    CredentialUpdate,
)
from app.services import connector_service

router = APIRouter(prefix="/api/v1/settings", tags=["settings"])


# ── Credentials ──


@router.get("/credentials/", response_model=list[CredentialRead])
async def list_credentials(
    active_only: bool = False,
    db: AsyncSession = Depends(get_db),
):
    return await connector_service.list_credentials(db, active_only=active_only)


@router.get("/credentials/summary", response_model=list[CredentialSummary])
async def list_credentials_summary(db: AsyncSession = Depends(get_db)):
    """Minimal list for dropdown selectors."""
    creds = await connector_service.list_credentials(db, active_only=True)
    return [{"id": c["id"], "name": c["name"], "auth_type": c["auth_type"], "base_url": c.get("base_url")} for c in creds]


@router.post("/credentials/", response_model=CredentialRead, status_code=201)
async def create_credential(
    data: CredentialCreate,
    db: AsyncSession = Depends(get_db),
):
    return await connector_service.create_credential(db, data)


@router.put("/credentials/{credential_id}", response_model=CredentialRead)
async def update_credential(
    credential_id: str,
    data: CredentialUpdate,
    db: AsyncSession = Depends(get_db),
):
    result = await connector_service.update_credential(db, credential_id, data)
    if not result:
        raise HTTPException(status_code=404, detail="Credential not found")
    return result


@router.delete("/credentials/{credential_id}", status_code=204)
async def delete_credential(
    credential_id: str,
    db: AsyncSession = Depends(get_db),
):
    deleted = await connector_service.delete_credential(db, credential_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Credential not found")


# ── Connectors ──


@router.get("/connectors/", response_model=list[ConnectorRead])
async def list_connectors(
    active_only: bool = False,
    db: AsyncSession = Depends(get_db),
):
    return await connector_service.list_connectors(db, active_only=active_only)


@router.get("/connectors/summary", response_model=list[ConnectorSummary])
async def list_connectors_summary(db: AsyncSession = Depends(get_db)):
    """Minimal list for dropdown selectors in KPI form."""
    conns = await connector_service.list_connectors(db, active_only=True)
    return [{"id": c["id"], "name": c["name"], "type": c["type"]} for c in conns]


@router.post("/connectors/", response_model=ConnectorRead, status_code=201)
async def create_connector(
    data: ConnectorCreate,
    db: AsyncSession = Depends(get_db),
):
    return await connector_service.create_connector(db, data)


@router.put("/connectors/{connector_id}", response_model=ConnectorRead)
async def update_connector(
    connector_id: str,
    data: ConnectorUpdate,
    db: AsyncSession = Depends(get_db),
):
    result = await connector_service.update_connector(db, connector_id, data)
    if not result:
        raise HTTPException(status_code=404, detail="Connector not found")
    return result


@router.delete("/connectors/{connector_id}", status_code=204)
async def delete_connector(
    connector_id: str,
    db: AsyncSession = Depends(get_db),
):
    deleted = await connector_service.delete_connector(db, connector_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Connector not found")
