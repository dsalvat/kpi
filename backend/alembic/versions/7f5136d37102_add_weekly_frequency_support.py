"""add_weekly_frequency_support

Revision ID: 7f5136d37102
Revises: fb09b6b018b6
Create Date: 2026-03-26 14:09:19.589246

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '7f5136d37102'
down_revision: Union[str, None] = 'fb09b6b018b6'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Add frequency column to kpi_definitions
    op.add_column(
        'kpi_definitions',
        sa.Column('frequency', sa.String(10), server_default='monthly', nullable=False),
    )

    # Add week column to kpi_values
    op.add_column(
        'kpi_values',
        sa.Column('week', sa.Integer(), nullable=True),
    )

    # Drop old unique constraint
    dialect = op.get_bind().dialect.name
    if dialect == 'postgresql':
        op.drop_constraint('uq_kpi_year_month', 'kpi_values', type_='unique')
        # Create partial unique indexes (PostgreSQL only)
        op.create_index(
            'uq_kpi_year_month_monthly', 'kpi_values',
            ['kpi_id', 'year', 'month'],
            unique=True,
            postgresql_where=sa.text('week IS NULL'),
        )
        op.create_index(
            'uq_kpi_year_week_weekly', 'kpi_values',
            ['kpi_id', 'year', 'week'],
            unique=True,
            postgresql_where=sa.text('week IS NOT NULL'),
        )
        op.execute(
            "ALTER TABLE kpi_values ADD CONSTRAINT ck_week_range "
            "CHECK (week IS NULL OR (week >= 1 AND week <= 53))"
        )
    # SQLite: keep simple unique index (no partial indexes support)


def downgrade() -> None:
    dialect = op.get_bind().dialect.name
    if dialect == 'postgresql':
        op.execute("ALTER TABLE kpi_values DROP CONSTRAINT IF EXISTS ck_week_range")
        op.drop_index('uq_kpi_year_week_weekly', 'kpi_values')
        op.drop_index('uq_kpi_year_month_monthly', 'kpi_values')
        op.create_unique_constraint('uq_kpi_year_month', 'kpi_values', ['kpi_id', 'year', 'month'])

    op.drop_column('kpi_values', 'week')
    op.drop_column('kpi_definitions', 'frequency')
