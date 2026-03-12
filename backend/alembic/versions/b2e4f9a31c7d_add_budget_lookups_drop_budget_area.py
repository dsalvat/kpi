"""add_budget_lookups_drop_budget_area

Revision ID: b2e4f9a31c7d
Revises: 0a36d381b6ca
Create Date: 2026-03-12 12:20:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = 'b2e4f9a31c7d'
down_revision: Union[str, None] = '0a36d381b6ca'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Create budget_lookups table
    op.create_table('budget_lookups',
        sa.Column('id', sa.Uuid(), nullable=False),
        sa.Column('category', sa.String(length=30), nullable=False),
        sa.Column('value', sa.String(length=200), nullable=False),
        sa.Column('display_order', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('active', sa.Boolean(), nullable=False, server_default='true'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_budget_lookups_category'), 'budget_lookups', ['category'], unique=False)

    # Drop budget_area from budget_items
    op.drop_column('budget_items', 'budget_area')


def downgrade() -> None:
    op.add_column('budget_items', sa.Column('budget_area', sa.VARCHAR(length=100), nullable=False, server_default='Sistemas'))
    op.drop_index(op.f('ix_budget_lookups_category'), table_name='budget_lookups')
    op.drop_table('budget_lookups')
