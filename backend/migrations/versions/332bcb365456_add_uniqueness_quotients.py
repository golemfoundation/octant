"""add uniqueness_quotients

Revision ID: 332bcb365456
Revises: 0eaa0e5e2dae
Create Date: 2024-06-04 22:01:25.589486

"""
from alembic import op
import sqlalchemy as sa


revision = "332bcb365456"
down_revision = "0eaa0e5e2dae"
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        "uniqueness_quotients",
        sa.Column("id", sa.INTEGER(), autoincrement=True, nullable=False),
        sa.Column("user_id", sa.INTEGER(), autoincrement=False, nullable=True),
        sa.Column("epoch", sa.INTEGER(), autoincrement=False, nullable=True),
        sa.Column("score", sa.VARCHAR(), autoincrement=False, nullable=True),
        sa.ForeignKeyConstraint(
            ["user_id"], ["users.id"], name="uniqueness_quotients___fk"
        ),
        sa.PrimaryKeyConstraint("id", name="uniqueness_quotients_pk"),
    )
    with op.batch_alter_table("uniqueness_quotients", schema=None) as batch_op:
        batch_op.create_index(
            "uniqueness_quotients_epoch_user_id_index",
            ["epoch", "user_id"],
            unique=False,
        )


def downgrade():
    with op.batch_alter_table("uniqueness_quotients", schema=None) as batch_op:
        batch_op.drop_index("uniqueness_quotients_epoch_user_id_index")

    op.drop_table("uniqueness_quotients")
