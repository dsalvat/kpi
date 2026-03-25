"""add_okr_responsibility_and_project_link

Revision ID: 61c4e8b4f9a0
Revises: 2f2eacb358fb
Create Date: 2026-03-25 08:43:46.571478

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '61c4e8b4f9a0'
down_revision: Union[str, None] = '2f2eacb358fb'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # OKR Objectives: responsible team + member
    op.add_column(
        "okr_objectives",
        sa.Column("responsible_team_id", sa.Uuid(), nullable=True),
    )
    op.add_column(
        "okr_objectives",
        sa.Column("responsible_member_id", sa.Uuid(), nullable=True),
    )
    op.create_foreign_key(
        "fk_okr_obj_team", "okr_objectives", "teams",
        ["responsible_team_id"], ["id"], ondelete="SET NULL",
    )
    op.create_foreign_key(
        "fk_okr_obj_member", "okr_objectives", "members",
        ["responsible_member_id"], ["id"], ondelete="SET NULL",
    )

    # OKR Key Results: project link + responsible team + member
    op.add_column(
        "okr_key_results",
        sa.Column("project_id", sa.Uuid(), nullable=True),
    )
    op.add_column(
        "okr_key_results",
        sa.Column("responsible_team_id", sa.Uuid(), nullable=True),
    )
    op.add_column(
        "okr_key_results",
        sa.Column("responsible_member_id", sa.Uuid(), nullable=True),
    )
    op.create_foreign_key(
        "fk_okr_kr_project", "okr_key_results", "projects",
        ["project_id"], ["id"], ondelete="SET NULL",
    )
    op.create_foreign_key(
        "fk_okr_kr_team", "okr_key_results", "teams",
        ["responsible_team_id"], ["id"], ondelete="SET NULL",
    )
    op.create_foreign_key(
        "fk_okr_kr_member", "okr_key_results", "members",
        ["responsible_member_id"], ["id"], ondelete="SET NULL",
    )


def downgrade() -> None:
    op.drop_constraint("fk_okr_kr_member", "okr_key_results", type_="foreignkey")
    op.drop_constraint("fk_okr_kr_team", "okr_key_results", type_="foreignkey")
    op.drop_constraint("fk_okr_kr_project", "okr_key_results", type_="foreignkey")
    op.drop_column("okr_key_results", "responsible_member_id")
    op.drop_column("okr_key_results", "responsible_team_id")
    op.drop_column("okr_key_results", "project_id")

    op.drop_constraint("fk_okr_obj_member", "okr_objectives", type_="foreignkey")
    op.drop_constraint("fk_okr_obj_team", "okr_objectives", type_="foreignkey")
    op.drop_column("okr_objectives", "responsible_member_id")
    op.drop_column("okr_objectives", "responsible_team_id")
