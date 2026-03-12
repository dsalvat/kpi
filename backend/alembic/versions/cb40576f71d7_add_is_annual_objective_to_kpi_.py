"""add_is_annual_objective_to_kpi_definitions

Revision ID: cb40576f71d7
Revises: b2e4f9a31c7d
Create Date: 2026-03-12 16:10:44.185234

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'cb40576f71d7'
down_revision: Union[str, None] = 'b2e4f9a31c7d'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('kpi_definitions', sa.Column('is_annual_objective', sa.Boolean(), nullable=False, server_default='false'))


def downgrade() -> None:
    op.drop_column('kpi_definitions', 'is_annual_objective')
