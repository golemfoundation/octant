"""Unify proposals to projects.

Revision ID: 1f5a0f69733a
Revises: 8ff293a1f737
Create Date: 2024-05-06 21:11:54.971440

"""
from alembic import op
import sqlalchemy as sa

revision = "1f5a0f69733a"
down_revision = "8ff293a1f737"
branch_labels = None
depends_on = None


def upgrade():
    with op.batch_alter_table("allocations", schema=None) as batch_op:
        batch_op.add_column(
            sa.Column("project_address", sa.String(length=42), nullable=False)
        )
        batch_op.drop_column("proposal_address")


def downgrade():
    with op.batch_alter_table("allocations", schema=None) as batch_op:
        batch_op.add_column(
            sa.Column("proposal_address", sa.VARCHAR(length=42), nullable=False)
        )
        batch_op.drop_column("project_address")
