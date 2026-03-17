import uuid
from datetime import datetime

from sqlalchemy import Column, DateTime, ForeignKey, String, Table, Text, UniqueConstraint, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base

# M:N association table
process_document_labels = Table(
    "process_document_labels",
    Base.metadata,
    Column("document_id", ForeignKey("process_documents.id", ondelete="CASCADE"), primary_key=True),
    Column("label_id", ForeignKey("process_labels.id", ondelete="CASCADE"), primary_key=True),
)


class ProcessLabel(Base):
    __tablename__ = "process_labels"
    __table_args__ = (UniqueConstraint("company_id", "name", name="uq_process_label_company_name"),)

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    company_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("companies.id"))
    name: Mapped[str] = mapped_column(String(100))
    color: Mapped[str | None] = mapped_column(String(7), nullable=True)  # hex e.g. #3B82F6
    active: Mapped[bool] = mapped_column(default=True)

    documents: Mapped[list["ProcessDocument"]] = relationship(
        secondary=process_document_labels, back_populates="labels"
    )


class ProcessDocument(Base):
    __tablename__ = "process_documents"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    company_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("companies.id"))
    title: Mapped[str] = mapped_column(String(300))
    content: Mapped[str] = mapped_column(Text, default="")
    created_by: Mapped[str | None] = mapped_column(String(100), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )
    active: Mapped[bool] = mapped_column(default=True)

    labels: Mapped[list[ProcessLabel]] = relationship(
        secondary=process_document_labels, back_populates="documents", lazy="selectin"
    )
