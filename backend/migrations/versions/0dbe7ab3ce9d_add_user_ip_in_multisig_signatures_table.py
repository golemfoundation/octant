"""add user ip in multisig signatures table

Revision ID: 0dbe7ab3ce9d
Revises: f923075e5877
Create Date: 2024-03-29 12:15:18.712651

"""
from alembic import op
import sqlalchemy as sa


revision = "0dbe7ab3ce9d"
down_revision = "f923075e5877"
branch_labels = None
depends_on = None


def upgrade():
    with op.batch_alter_table("multisig_signatures", schema=None) as batch_op:
        batch_op.add_column(sa.Column("user_ip", sa.String(), nullable=False))


def downgrade():
    with op.batch_alter_table("multisig_signatures", schema=None) as batch_op:
        batch_op.drop_column("user_ip")
