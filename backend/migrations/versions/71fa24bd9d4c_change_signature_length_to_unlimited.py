"""Change signature length to unlimited

Revision ID: 71fa24bd9d4c
Revises: 0dbe7ab3ce9d
Create Date: 2024-04-03 09:47:22.262425

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = "71fa24bd9d4c"
down_revision = "0dbe7ab3ce9d"
branch_labels = None
depends_on = None


def upgrade():
    with op.batch_alter_table("allocations_requests", schema=None) as batch_op:
        batch_op.alter_column(
            "signature", existing_type=sa.String(132), type_=sa.String(), nullable=False
        )


def downgrade():
    with op.batch_alter_table("allocations_requests", schema=None) as batch_op:
        batch_op.alter_column(
            "signature", existing_type=sa.String(), type_=sa.String(132), nullable=False
        )
