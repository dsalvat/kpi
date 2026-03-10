import uuid

from sqlalchemy import ForeignKey, String, Text
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class Credential(Base):
    __tablename__ = "credentials"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    name: Mapped[str] = mapped_column(String(100), unique=True)
    auth_type: Mapped[str] = mapped_column(String(20))  # basic | bearer | api_key
    username: Mapped[str | None] = mapped_column(String(200), nullable=True)
    token: Mapped[str] = mapped_column(Text)  # encrypted/hashed in practice
    base_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    active: Mapped[bool] = mapped_column(default=True)

    connectors: Mapped[list["Connector"]] = relationship(
        back_populates="credential", cascade="all, delete-orphan"
    )


class Connector(Base):
    __tablename__ = "connectors"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    name: Mapped[str] = mapped_column(String(200), unique=True)
    type: Mapped[str] = mapped_column(String(20))  # api_rest | ai_agent | mcp
    credential_id: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("credentials.id"), nullable=True
    )
    config: Mapped[dict | None] = mapped_column(JSONB, nullable=True)
    # config examples:
    #   api_rest: {"endpoint": "/api/data", "method": "GET", "headers": {}}
    #   ai_agent: {"system_prompt": "...", "provider": "rovo"}
    active: Mapped[bool] = mapped_column(default=True)

    credential: Mapped["Credential | None"] = relationship(back_populates="connectors")
    kpis: Mapped[list["KPIDefinition"]] = relationship(back_populates="connector")
