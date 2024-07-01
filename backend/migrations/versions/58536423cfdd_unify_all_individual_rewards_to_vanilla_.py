"""Unify all_individual_rewards to vanilla_individual_rewards

Revision ID: 58536423cfdd
Revises: a2701c6b232a
Create Date: 2024-05-21 00:43:35.531733

"""
import sqlalchemy as sa
from alembic import op

revision = "58536423cfdd"
down_revision = "a2701c6b232a"
branch_labels = None
depends_on = None


def upgrade():
    with op.batch_alter_table("pending_epoch_snapshots", schema=None) as batch_op:
        batch_op.alter_column(
            column_name="all_individual_rewards",
            new_column_name="vanilla_individual_rewards",
        )


def downgrade():
    with op.batch_alter_table("pending_epoch_snapshots", schema=None) as batch_op:
        batch_op.alter_column(
            column_name="vanilla_individual_rewards",
            new_column_name="all_individual_rewards",
        )
