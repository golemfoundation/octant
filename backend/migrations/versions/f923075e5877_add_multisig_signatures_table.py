"""add multisig signatures table

Revision ID: f923075e5877
Revises: 7bb6835486a5
Create Date: 2024-03-27 14:30:56.869637

"""
from alembic import op
import sqlalchemy as sa


revision = "f923075e5877"
down_revision = "7bb6835486a5"
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
