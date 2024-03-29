"""add column of isManuallyEdited to allocations_requests table

Revision ID: 449308032075
Revises: f81d796a7ab8
Create Date: 2024-01-12 12:17:44.735026

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = "449308032075"
down_revision = "f81d796a7ab8"
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table("allocations_signatures", schema=None) as batch_op:
        batch_op.add_column(
            sa.Column("is_manually_edited", sa.Boolean(), nullable=True)
        )

    op.rename_table("allocations_signatures", "allocations_requests")

    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.rename_table("allocations_requests", "allocations_signatures")
    with op.batch_alter_table("allocations_signatures", schema=None) as batch_op:
        batch_op.drop_column("is_manually_edited")

    # ### end Alembic commands ###
