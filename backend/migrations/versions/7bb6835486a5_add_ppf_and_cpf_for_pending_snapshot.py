"""add_ppf_and_cpf_for_pending_snapshot

Revision ID: 7bb6835486a5
Revises: 1d7b215a9201
Create Date: 2024-03-08 14:24:02.791821

"""
from alembic import op
import sqlalchemy as sa


revision = "7bb6835486a5"
down_revision = "1d7b215a9201"
branch_labels = None
depends_on = None


def upgrade():
    with op.batch_alter_table("pending_epoch_snapshots", schema=None) as batch_op:
        batch_op.add_column(sa.Column("ppf", sa.String(), nullable=True))
        batch_op.add_column(sa.Column("community_fund", sa.String(), nullable=True))


def downgrade():
    with op.batch_alter_table("pending_epoch_snapshots", schema=None) as batch_op:
        batch_op.drop_column("community_fund")
        batch_op.drop_column("ppf")
