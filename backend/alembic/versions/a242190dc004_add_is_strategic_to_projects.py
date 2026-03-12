"""add_is_strategic_to_projects

Revision ID: a242190dc004
Revises: cb40576f71d7
Create Date: 2026-03-12 23:05:47.589684

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'a242190dc004'
down_revision: Union[str, None] = 'cb40576f71d7'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('projects', sa.Column('is_strategic', sa.Boolean(), server_default='false', nullable=False))


def downgrade() -> None:
    op.drop_column('projects', 'is_strategic')
