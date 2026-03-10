import uuid

from pydantic import BaseModel, Field


# ── Credential Schemas ──


class CredentialCreate(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    auth_type: str = Field(pattern=r"^(basic|bearer|api_key)$")
    username: str | None = None
    token: str = Field(min_length=1)
    base_url: str | None = None
    active: bool = True


class CredentialUpdate(BaseModel):
    name: str | None = None
    auth_type: str | None = None
    username: str | None = None
    token: str | None = None  # only sent when changing
    base_url: str | None = None
    active: bool | None = None


class CredentialRead(BaseModel):
    id: uuid.UUID
    name: str
    auth_type: str
    username: str | None = None
    token_masked: str  # e.g. "****abcd"
    base_url: str | None = None
    active: bool

    model_config = {"from_attributes": True}


class CredentialSummary(BaseModel):
    """Minimal credential info for dropdowns."""
    id: uuid.UUID
    name: str
    auth_type: str
    base_url: str | None = None

    model_config = {"from_attributes": True}


# ── Connector Schemas ──


class ConnectorCreate(BaseModel):
    name: str = Field(min_length=1, max_length=200)
    type: str = Field(pattern=r"^(api_rest|ai_agent|mcp)$")
    credential_id: uuid.UUID | None = None
    config: dict | None = None
    active: bool = True


class ConnectorUpdate(BaseModel):
    name: str | None = None
    type: str | None = None
    credential_id: uuid.UUID | None = None
    config: dict | None = None
    active: bool | None = None


class ConnectorRead(BaseModel):
    id: uuid.UUID
    name: str
    type: str
    credential_id: uuid.UUID | None = None
    credential_name: str | None = None
    config: dict | None = None
    active: bool

    model_config = {"from_attributes": True}


class ConnectorSummary(BaseModel):
    """Minimal connector info for dropdowns."""
    id: uuid.UUID
    name: str
    type: str

    model_config = {"from_attributes": True}
