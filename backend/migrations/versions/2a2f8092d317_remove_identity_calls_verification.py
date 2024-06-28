"""remove identity calls verification

Revision ID: 2a2f8092d317
Revises: f7dcfb8d241a
Create Date: 2024-06-18 14:25:58.130557

"""
import sqlalchemy as sa
from alembic import op

revision = "2a2f8092d317"
down_revision = "f7dcfb8d241a"
branch_labels = None
depends_on = None


def upgrade():
    op.drop_table("identity_call_verifications")


def downgrade():
    op.create_table(
        "identity_call_verifications",
        sa.Column("id", sa.INTEGER(), nullable=False),
        sa.Column("address", sa.VARCHAR(length=42), nullable=False),
        sa.Column("created_at", sa.TIMESTAMP(), nullable=True),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("address"),
    )
