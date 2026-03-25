"""make_member_team_id_nullable

Revision ID: 26389c449a5e
Revises: 61c4e8b4f9a0
Create Date: 2026-03-25 13:40:51.005799

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '26389c449a5e'
down_revision: Union[str, None] = '61c4e8b4f9a0'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.alter_column("members", "team_id", existing_type=sa.Uuid(), nullable=True)


def downgrade() -> None:
    # Set any NULL team_ids to a default before making NOT NULL again
    op.alter_column("members", "team_id", existing_type=sa.Uuid(), nullable=False)
