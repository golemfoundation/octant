"""add multisig signatures table

Revision ID: 8d20fabc0926
Revises: 1f89a0fae4ae
Create Date: 2024-03-25 14:46:00.087064

"""
from alembic import op
import sqlalchemy as sa


revision = "8d20fabc0926"
down_revision = "1f89a0fae4ae"
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        "multisig_signatures",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("address", sa.String(length=42), nullable=False),
        sa.Column("type", sa.String(), nullable=False),
        sa.Column("message", sa.String(), nullable=False),
        sa.Column("hash", sa.String(), nullable=False),
        sa.Column("status", sa.String(), nullable=False),
        sa.Column("created_at", sa.TIMESTAMP(), nullable=True),
        sa.PrimaryKeyConstraint("id"),
    )


def downgrade():
    op.drop_table("multisig_signatures")
