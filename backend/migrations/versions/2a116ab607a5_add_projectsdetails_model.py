"""Add ProjectsDetails model

Revision ID: 2a116ab607a5
Revises: 8b425b454a86
Create Date: 2024-09-18 13:24:05.146072

"""
import sqlalchemy as sa
from alembic import op

revision = "2a116ab607a5"
down_revision = "8b425b454a86"
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        "project_details",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("address", sa.String(length=42), nullable=False),
        sa.Column("name", sa.String(), nullable=False),
        sa.Column("created_at", sa.TIMESTAMP(), nullable=True),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("address"),
        sa.UniqueConstraint("name"),
    )


def downgrade():
    op.drop_table("project_details")
