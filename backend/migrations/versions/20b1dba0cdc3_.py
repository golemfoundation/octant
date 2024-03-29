"""empty message

Revision ID: 20b1dba0cdc3
Revises: 8d2a74deb60c
Create Date: 2023-10-06 13:32:37.057957

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = "20b1dba0cdc3"
down_revision = "8d2a74deb60c"
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table("users", schema=None) as batch_op:
        batch_op.add_column(sa.Column("patron_mode", sa.Boolean(), nullable=True))

    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table("users", schema=None) as batch_op:
        batch_op.drop_column("patron_mode")

    # ### end Alembic commands ###
