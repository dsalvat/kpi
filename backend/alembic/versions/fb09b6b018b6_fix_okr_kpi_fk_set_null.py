"""fix_okr_kpi_fk_set_null

Revision ID: fb09b6b018b6
Revises: 26389c449a5e
Create Date: 2026-03-25 15:12:03.235574

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'fb09b6b018b6'
down_revision: Union[str, None] = '26389c449a5e'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Drop the old FK without ON DELETE and recreate with SET NULL
    op.drop_constraint("okr_key_results_kpi_id_fkey", "okr_key_results", type_="foreignkey")
    op.create_foreign_key(
        "okr_key_results_kpi_id_fkey", "okr_key_results", "kpi_definitions",
        ["kpi_id"], ["id"], ondelete="SET NULL",
    )


def downgrade() -> None:
    op.drop_constraint("okr_key_results_kpi_id_fkey", "okr_key_results", type_="foreignkey")
    op.create_foreign_key(
        "okr_key_results_kpi_id_fkey", "okr_key_results", "kpi_definitions",
        ["kpi_id"], ["id"],
    )
