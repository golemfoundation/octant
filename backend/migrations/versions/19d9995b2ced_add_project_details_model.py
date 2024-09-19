"""Add Project Details model

Revision ID: 19d9995b2ced
Revises: 8b425b454a86
Create Date: 2024-09-19 10:51:23.771153

"""
from alembic import op
import sqlalchemy as sa


revision = "19d9995b2ced"
down_revision = "8b425b454a86"
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        "project_details",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("address", sa.String(length=42), nullable=False),
        sa.Column("name", sa.String(), nullable=False),
        sa.Column("epoch", sa.Integer(), nullable=False),
        sa.Column("created_at", sa.TIMESTAMP(), nullable=True),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("address", "epoch", name="uq_address_epoch"),
    )


def downgrade():
    op.drop_table("project_details")
