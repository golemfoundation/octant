"""add delegation table

Revision ID: 0eaa0e5e2dae
Revises: 58536423cfdd
Create Date: 2024-05-28 15:09:56.331148

"""
from alembic import op
import sqlalchemy as sa


revision = "0eaa0e5e2dae"
down_revision = "58536423cfdd"
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        "score_delegation",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("hashed_addr", sa.String(), nullable=False),
        sa.Column("created_at", sa.TIMESTAMP(), nullable=True),
        sa.PrimaryKeyConstraint("id"),
    )


def downgrade():
    op.drop_table("score_delegation")
