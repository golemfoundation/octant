"""add allocation nonce

Revision ID: 79532eaf12d0
Revises: 5be0b6f99ee7
Create Date: 2023-09-06 14:21:25.237635

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = "79532eaf12d0"
down_revision = "5be0b6f99ee7"
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table("allocations", schema=None) as batch_op:
        batch_op.add_column(sa.Column("nonce", sa.Integer(), nullable=False))

    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table("allocations", schema=None) as batch_op:
        batch_op.drop_column("nonce")

    # ### end Alembic commands ###
