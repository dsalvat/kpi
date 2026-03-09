from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.connector import Connector, Credential
from app.schemas.connector import (
    ConnectorCreate,
    ConnectorUpdate,
    CredentialCreate,
    CredentialUpdate,
)


def _mask_token(token: str) -> str:
    if len(token) <= 4:
        return "****"
    return "****" + token[-4:]


def _credential_to_dict(cred: Credential) -> dict:
    return {
        "id": cred.id,
        "name": cred.name,
        "auth_type": cred.auth_type,
        "username": cred.username,
        "token_masked": _mask_token(cred.token),
        "base_url": cred.base_url,
        "active": cred.active,
    }


def _connector_to_dict(conn: Connector) -> dict:
    return {
        "id": conn.id,
        "name": conn.name,
        "type": conn.type,
        "credential_id": conn.credential_id,
        "credential_name": conn.credential.name if conn.credential else None,
        "config": conn.config,
        "active": conn.active,
    }


# ── Credentials CRUD ──


async def list_credentials(db: AsyncSession, active_only: bool = False) -> list[dict]:
    stmt = select(Credential).order_by(Credential.name)
    if active_only:
        stmt = stmt.where(Credential.active.is_(True))
    result = await db.execute(stmt)
    return [_credential_to_dict(c) for c in result.scalars().all()]


async def get_credential(db: AsyncSession, credential_id) -> Credential | None:
    stmt = select(Credential).where(Credential.id == credential_id)
    result = await db.execute(stmt)
    return result.scalar_one_or_none()


async def create_credential(db: AsyncSession, data: CredentialCreate) -> dict:
    cred = Credential(
        name=data.name,
        auth_type=data.auth_type,
        username=data.username,
        token=data.token,
        base_url=data.base_url,
        active=data.active,
    )
    db.add(cred)
    await db.commit()
    await db.refresh(cred)
    return _credential_to_dict(cred)


async def update_credential(db: AsyncSession, credential_id, data: CredentialUpdate) -> dict | None:
    cred = await get_credential(db, credential_id)
    if not cred:
        return None
    update_fields = data.model_dump(exclude_unset=True)
    for field, value in update_fields.items():
        setattr(cred, field, value)
    await db.commit()
    await db.refresh(cred)
    return _credential_to_dict(cred)


async def delete_credential(db: AsyncSession, credential_id) -> bool:
    cred = await get_credential(db, credential_id)
    if not cred:
        return False
    await db.delete(cred)
    await db.commit()
    return True


# ── Connectors CRUD ──


async def list_connectors(db: AsyncSession, active_only: bool = False) -> list[dict]:
    stmt = select(Connector).options(selectinload(Connector.credential)).order_by(Connector.name)
    if active_only:
        stmt = stmt.where(Connector.active.is_(True))
    result = await db.execute(stmt)
    return [_connector_to_dict(c) for c in result.scalars().all()]


async def get_connector(db: AsyncSession, connector_id) -> Connector | None:
    stmt = select(Connector).options(selectinload(Connector.credential)).where(Connector.id == connector_id)
    result = await db.execute(stmt)
    return result.scalar_one_or_none()


async def create_connector(db: AsyncSession, data: ConnectorCreate) -> dict:
    conn = Connector(
        name=data.name,
        type=data.type,
        credential_id=data.credential_id,
        config=data.config,
        active=data.active,
    )
    db.add(conn)
    await db.commit()
    # Reload with credential relationship
    result = await db.execute(
        select(Connector).options(selectinload(Connector.credential)).where(Connector.id == conn.id)
    )
    conn = result.scalar_one()
    return _connector_to_dict(conn)


async def update_connector(db: AsyncSession, connector_id, data: ConnectorUpdate) -> dict | None:
    conn = await get_connector(db, connector_id)
    if not conn:
        return None
    update_fields = data.model_dump(exclude_unset=True)
    for field, value in update_fields.items():
        setattr(conn, field, value)
    await db.commit()
    # Reload
    result = await db.execute(
        select(Connector).options(selectinload(Connector.credential)).where(Connector.id == conn.id)
    )
    conn = result.scalar_one()
    return _connector_to_dict(conn)


async def delete_connector(db: AsyncSession, connector_id) -> bool:
    conn = await get_connector(db, connector_id)
    if not conn:
        return False
    await db.delete(conn)
    await db.commit()
    return True
