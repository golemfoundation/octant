"""Remove existing delegations and gp stamps before AW6

Revision ID: 6ab87f7762d8
Revises: 2e1e54ed62d3
Create Date: 2025-01-09 10:53:09.674239

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = "6ab87f7762d8"
down_revision = "2e1e54ed62d3"
branch_labels = None
depends_on = None


def upgrade():
    op.execute("TRUNCATE TABLE score_delegation")
    op.execute("TRUNCATE TABLE gitcoin_passport_stamps")


def downgrade():
    pass
