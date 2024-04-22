"""add leverage column to allocation request

Revision ID: 8ff293a1f737
Revises: fc7a01c20be5
Create Date: 2024-04-05 11:44:37.629682

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = "8ff293a1f737"
down_revision = "8e72b01c43a7"
branch_labels = None
depends_on = None


def upgrade():
    with op.batch_alter_table("allocations_requests", schema=None) as batch_op:
        batch_op.add_column(sa.Column("leverage", sa.Float(), nullable=True))


def downgrade():
    with op.batch_alter_table("allocations_requests", schema=None) as batch_op:
        batch_op.drop_column("leverage")
