"""add identity calls verification

Revision ID: 5de3d4f3258c
Revises: 332bcb365456
Create Date: 2024-06-05 13:26:54.828843

"""
from alembic import op
import sqlalchemy as sa


revision = "5de3d4f3258c"
down_revision = "332bcb365456"
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        "identity_call_verifications",
        sa.Column("address", sa.String(length=42), nullable=False),
        sa.Column("created_at", sa.TIMESTAMP(), nullable=True),
        sa.PrimaryKeyConstraint("address"),
    )
    with op.batch_alter_table("uniqueness_quotients", schema=None) as batch_op:
        batch_op.add_column(sa.Column("created_at", sa.TIMESTAMP(), nullable=True))
        batch_op.alter_column("epoch", existing_type=sa.INTEGER(), nullable=False)
        batch_op.alter_column("score", existing_type=sa.VARCHAR(), nullable=False)
        batch_op.drop_index("uniqueness_quotients_epoch_user_id_index")


def downgrade():
    with op.batch_alter_table("uniqueness_quotients", schema=None) as batch_op:
        batch_op.create_index(
            "uniqueness_quotients_epoch_user_id_index",
            ["epoch", "user_id"],
            unique=False,
        )
        batch_op.alter_column("score", existing_type=sa.VARCHAR(), nullable=True)
        batch_op.alter_column("epoch", existing_type=sa.INTEGER(), nullable=True)
        batch_op.drop_column("created_at")

    op.drop_table("identity_call_verifications")
