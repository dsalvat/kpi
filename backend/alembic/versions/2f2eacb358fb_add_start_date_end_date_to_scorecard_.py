"""add start_date end_date to scorecard_indicators

Revision ID: 2f2eacb358fb
Revises: 2da60b25cabf
Create Date: 2026-03-24 10:00:40.587691

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '2f2eacb358fb'
down_revision: Union[str, None] = '2da60b25cabf'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('scorecard_indicators', sa.Column('start_date', sa.Date(), nullable=True))
    op.add_column('scorecard_indicators', sa.Column('end_date', sa.Date(), nullable=True))


def downgrade() -> None:
    op.drop_column('scorecard_indicators', 'end_date')
    op.drop_column('scorecard_indicators', 'start_date')
