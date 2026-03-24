"""add scorecards indicators and values

Revision ID: 2da60b25cabf
Revises: 1a8c74d63a4d
Create Date: 2026-03-24 08:51:31.918089

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


# revision identifiers, used by Alembic.
revision: str = '2da60b25cabf'
down_revision: Union[str, None] = '1a8c74d63a4d'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        'scorecards',
        sa.Column('id', sa.UUID(), nullable=False, default=sa.text('gen_random_uuid()')),
        sa.Column('company_id', sa.UUID(), nullable=False),
        sa.Column('year', sa.Integer(), nullable=False),
        sa.Column('org_level', sa.String(20), nullable=False),
        sa.Column('org_entity_id', sa.UUID(), nullable=False),
        sa.Column('name', sa.String(300), nullable=False),
        sa.Column('operational_weight', sa.Numeric(5, 2), server_default='50.00', nullable=False),
        sa.Column('management_weight', sa.Numeric(5, 2), server_default='50.00', nullable=False),
        sa.Column('active', sa.Boolean(), server_default='true', nullable=False),
        sa.ForeignKeyConstraint(['company_id'], ['companies.id']),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('company_id', 'year', 'org_level', 'org_entity_id',
                            name='uq_scorecard_org_year'),
    )

    op.create_table(
        'scorecard_indicators',
        sa.Column('id', sa.UUID(), nullable=False, default=sa.text('gen_random_uuid()')),
        sa.Column('scorecard_id', sa.UUID(), nullable=False),
        sa.Column('name', sa.String(500), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('category', sa.String(20), nullable=False),
        sa.Column('indicator_type', sa.String(20), server_default='continuous', nullable=False),
        sa.Column('target_value', sa.Numeric(12, 4), nullable=False),
        sa.Column('unit', sa.String(20), server_default='%', nullable=False),
        sa.Column('weight_pct', sa.Numeric(5, 2), nullable=False),
        sa.Column('direction', sa.String(15), server_default='higher_better', nullable=False),
        sa.Column('frequency', sa.String(15), server_default='monthly', nullable=False),
        sa.Column('source', sa.String(100), nullable=True),
        sa.Column('source_config', postgresql.JSONB(), nullable=True),
        sa.Column('kpi_definition_id', sa.UUID(), nullable=True),
        sa.Column('project_id', sa.UUID(), nullable=True),
        sa.Column('connector_id', sa.UUID(), nullable=True),
        sa.Column('shared_group_id', sa.UUID(), nullable=True),
        sa.Column('order_idx', sa.Integer(), server_default='0', nullable=False),
        sa.Column('active', sa.Boolean(), server_default='true', nullable=False),
        sa.ForeignKeyConstraint(['scorecard_id'], ['scorecards.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['kpi_definition_id'], ['kpi_definitions.id'], ondelete='SET NULL'),
        sa.ForeignKeyConstraint(['project_id'], ['projects.id'], ondelete='SET NULL'),
        sa.ForeignKeyConstraint(['connector_id'], ['connectors.id'], ondelete='SET NULL'),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index('ix_scorecard_indicators_shared_group_id',
                    'scorecard_indicators', ['shared_group_id'])

    op.create_table(
        'indicator_values',
        sa.Column('id', sa.UUID(), nullable=False, default=sa.text('gen_random_uuid()')),
        sa.Column('indicator_id', sa.UUID(), nullable=False),
        sa.Column('year', sa.Integer(), nullable=False),
        sa.Column('period_type', sa.String(15), nullable=False),
        sa.Column('period', sa.Integer(), nullable=False),
        sa.Column('value', sa.Numeric(12, 4), nullable=False),
        sa.Column('collected_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('collection_method', sa.String(20), server_default='manual', nullable=False),
        sa.Column('notes', sa.Text(), nullable=True),
        sa.Column('actions_done', sa.Text(), nullable=True),
        sa.Column('actions_next', sa.Text(), nullable=True),
        sa.ForeignKeyConstraint(['indicator_id'], ['scorecard_indicators.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('indicator_id', 'year', 'period_type', 'period',
                            name='uq_indicator_value_period'),
    )


def downgrade() -> None:
    op.drop_table('indicator_values')
    op.drop_index('ix_scorecard_indicators_shared_group_id', 'scorecard_indicators')
    op.drop_table('scorecard_indicators')
    op.drop_table('scorecards')
