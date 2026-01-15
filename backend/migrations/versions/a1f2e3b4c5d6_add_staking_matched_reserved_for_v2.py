"""add_staking_matched_reserved_for_v2

Revision ID: a1f2e3b4c5d6
Revises: b5d0a4e49513
Create Date: 2026-01-15 10:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


revision = "a1f2e3b4c5d6"
down_revision = "b5d0a4e49513"  # E10 truncate delegations migration
branch_labels = None
depends_on = None


def upgrade():
    with op.batch_alter_table("finalized_epoch_snapshots", schema=None) as batch_op:
        batch_op.add_column(
            sa.Column(
                "staking_matched_reserved_for_v2",
                sa.String(),
                nullable=False,
                server_default="0",
                comment="Staking portion of matched rewards reserved for future v2 rounds (wei)",
            )
        )


def downgrade():
    with op.batch_alter_table("finalized_epoch_snapshots", schema=None) as batch_op:
        batch_op.drop_column("staking_matched_reserved_for_v2")
