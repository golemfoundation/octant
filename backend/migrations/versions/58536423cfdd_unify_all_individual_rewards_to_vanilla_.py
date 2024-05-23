"""Unify all_individual_rewards to vanilla_individual_rewards

Revision ID: 58536423cfdd
Revises: 1f5a0f69733a
Create Date: 2024-05-21 00:43:35.531733

"""
import sqlalchemy as sa
from alembic import op

revision = "58536423cfdd"
down_revision = "1f5a0f69733a"
branch_labels = None
depends_on = None


def upgrade():
    with op.batch_alter_table("pending_epoch_snapshots", schema=None) as batch_op:
        batch_op.add_column(
            sa.Column("vanilla_individual_rewards", sa.String(), nullable=False)
        )
        batch_op.drop_column("all_individual_rewards")


def downgrade():
    with op.batch_alter_table("pending_epoch_snapshots", schema=None) as batch_op:
        batch_op.add_column(
            sa.Column("all_individual_rewards", sa.VARCHAR(), nullable=False)
        )
        batch_op.drop_column("vanilla_individual_rewards")
