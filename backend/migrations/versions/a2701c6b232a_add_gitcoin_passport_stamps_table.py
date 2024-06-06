"""add gitcoin passport stamps table

Revision ID: a2701c6b232a
Revises: 1f5a0f69733a
Create Date: 2024-05-15 15:08:50.650544

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = "a2701c6b232a"
down_revision = "1f5a0f69733a"
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        "gitcoin_passport_stamps",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("score", sa.Float(), nullable=False),
        sa.Column("expires_at", sa.TIMESTAMP(), nullable=False),
        sa.Column("stamps", sa.String(), nullable=False),
        sa.Column("created_at", sa.TIMESTAMP(), nullable=True),
        sa.ForeignKeyConstraint(
            ["user_id"],
            ["users.id"],
        ),
        sa.PrimaryKeyConstraint("id"),
    )


def downgrade():
    op.drop_table("gitcoin_passport_stamps")
