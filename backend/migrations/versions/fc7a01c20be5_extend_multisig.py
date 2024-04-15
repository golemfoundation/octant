"""add confirmed_signature, msg_hash and safe_msg_hash in multisig signatures table

Revision ID: fc7a01c20be5
Revises: 71fa24bd9d4c
Create Date: 2024-04-05 09:03:28.436945

"""
from alembic import op
import sqlalchemy as sa


revision = "fc7a01c20be5"
down_revision = "71fa24bd9d4c"
branch_labels = None
depends_on = None


def upgrade():
    with op.batch_alter_table("multisig_signatures", schema=None) as batch_op:
        batch_op.add_column(sa.Column("msg_hash", sa.String(), nullable=False))
        batch_op.add_column(sa.Column("safe_msg_hash", sa.String(), nullable=False))
        batch_op.add_column(
            sa.Column("confirmed_signature", sa.String(), nullable=True)
        )
        batch_op.drop_column("hash")


def downgrade():
    with op.batch_alter_table("multisig_signatures", schema=None) as batch_op:
        batch_op.add_column(sa.Column("hash", sa.VARCHAR(), nullable=False))
        batch_op.drop_column("confirmed_signature")
        batch_op.drop_column("safe_msg_hash")
        batch_op.drop_column("msg_hash")
