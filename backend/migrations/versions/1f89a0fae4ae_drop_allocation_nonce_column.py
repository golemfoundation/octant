"""drop allocation nonce column from user table

Revision ID: 1f89a0fae4ae
Revises: 7bb6835486a5
Create Date: 2024-03-12 18:00:32.503807

"""
from alembic import op
import sqlalchemy as sa


revision = "1f89a0fae4ae"
down_revision = "7bb6835486a5"
branch_labels = None
depends_on = None


def upgrade():
    with op.batch_alter_table("users", schema=None) as batch_op:
        batch_op.drop_column("allocation_nonce")


def downgrade():
    with op.batch_alter_table("users", schema=None) as batch_op:
        batch_op.add_column(
            sa.Column(
                "allocation_nonce", sa.INTEGER(), autoincrement=False, nullable=True
            )
        )
