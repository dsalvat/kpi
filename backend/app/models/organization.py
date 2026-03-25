import uuid

from sqlalchemy import Boolean, ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class Company(Base):
    __tablename__ = "companies"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    name: Mapped[str] = mapped_column(String(200))
    slug: Mapped[str] = mapped_column(String(50), unique=True, index=True)
    active: Mapped[bool] = mapped_column(Boolean, default=True, server_default="true")

    departments: Mapped[list["Department"]] = relationship(
        back_populates="company", cascade="all, delete-orphan"
    )
    members: Mapped[list["Member"]] = relationship(
        back_populates="company", cascade="all, delete-orphan"
    )


class Department(Base):
    __tablename__ = "departments"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    company_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("companies.id"))
    name: Mapped[str] = mapped_column(String(200))
    code: Mapped[str] = mapped_column(String(20))
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    director_id: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("members.id", ondelete="SET NULL", use_alter=True),
        nullable=True,
    )
    active: Mapped[bool] = mapped_column(Boolean, default=True, server_default="true")

    company: Mapped["Company"] = relationship(back_populates="departments")
    areas: Mapped[list["Area"]] = relationship(
        back_populates="department", cascade="all, delete-orphan"
    )
    director: Mapped["Member | None"] = relationship(
        foreign_keys=[director_id], post_update=True,
    )


class Area(Base):
    __tablename__ = "areas"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    department_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("departments.id"))
    name: Mapped[str] = mapped_column(String(200))
    code: Mapped[str] = mapped_column(String(20))
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    responsable_id: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("members.id", ondelete="SET NULL", use_alter=True),
        nullable=True,
    )
    active: Mapped[bool] = mapped_column(Boolean, default=True, server_default="true")

    department: Mapped["Department"] = relationship(back_populates="areas")
    teams: Mapped[list["Team"]] = relationship(
        back_populates="area", cascade="all, delete-orphan"
    )
    responsable: Mapped["Member | None"] = relationship(
        foreign_keys=[responsable_id], post_update=True,
    )


class Team(Base):
    __tablename__ = "teams"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    area_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("areas.id"))
    name: Mapped[str] = mapped_column(String(200))
    code: Mapped[str] = mapped_column(String(20))
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    coordinador_id: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("members.id", ondelete="SET NULL", use_alter=True),
        nullable=True,
    )
    active: Mapped[bool] = mapped_column(Boolean, default=True, server_default="true")

    area: Mapped["Area"] = relationship(back_populates="teams")
    members: Mapped[list["Member"]] = relationship(
        back_populates="team", foreign_keys="[Member.team_id]",
        cascade="all, delete-orphan",
    )
    coordinador: Mapped["Member | None"] = relationship(
        foreign_keys=[coordinador_id], post_update=True,
    )


class Member(Base):
    __tablename__ = "members"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    company_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("companies.id"))
    team_id: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("teams.id"), nullable=True
    )
    first_name: Mapped[str] = mapped_column(String(100))
    last_name: Mapped[str] = mapped_column(String(100))
    email: Mapped[str] = mapped_column(String(200))
    position: Mapped[str | None] = mapped_column(String(100), nullable=True)
    role: Mapped[str] = mapped_column(
        String(20), default="membre"
    )  # director | responsable | coordinador | membre
    active: Mapped[bool] = mapped_column(Boolean, default=True, server_default="true")

    company: Mapped["Company"] = relationship(back_populates="members")
    team: Mapped["Team | None"] = relationship(
        back_populates="members", foreign_keys=[team_id],
    )
