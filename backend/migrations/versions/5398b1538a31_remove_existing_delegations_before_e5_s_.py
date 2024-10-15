"""Remove existing delegations before E5's AW

Revision ID: 5398b1538a31
Revises: 2060b4c232c6
Create Date: 2024-10-11 12:58:19.806125

"""
from alembic import op


revision = "5398b1538a31"
down_revision = "2060b4c232c6"
branch_labels = None
depends_on = None


def upgrade():
    op.execute("TRUNCATE TABLE score_delegation")
    op.execute("TRUNCATE TABLE gitcoin_passport_stamps")


def downgrade():
    pass
