"""add_group_field_to_kpi_definitions

Revision ID: 7e6ce13785b8
Revises: c709ba5c5073
Create Date: 2026-03-09 12:47:54.908532

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '7e6ce13785b8'
down_revision: Union[str, None] = 'c709ba5c5073'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Add column as nullable first
    op.add_column('kpi_definitions', sa.Column('group', sa.String(length=20), nullable=True))

    # Populate group based on code prefix
    op.execute("UPDATE kpi_definitions SET \"group\" = 'serveis' WHERE code LIKE 'SRV-%'")
    op.execute("UPDATE kpi_definitions SET \"group\" = 'projectes' WHERE code LIKE 'PRJ-%' AND category != 'valor'")
    op.execute("UPDATE kpi_definitions SET \"group\" = 'valor' WHERE category = 'valor'")
    # Fallback: anything still NULL gets 'serveis'
    op.execute("UPDATE kpi_definitions SET \"group\" = 'serveis' WHERE \"group\" IS NULL")

    # Now make it NOT NULL
    op.alter_column('kpi_definitions', 'group', nullable=False, server_default='serveis')


def downgrade() -> None:
    op.drop_column('kpi_definitions', 'group')
