"""E10: Truncate existing delegations and GP stamps

Revision ID: 3f7a9c2e5b1d
Revises: e2f4c1a7b8d9
Create Date: 2026-02-03 13:32:19.124428

"""
from alembic import op


revision = "e2f4c1a7b8d9"
down_revision = "e2f4c1a7b8d9"
branch_labels = None
depends_on = None


def upgrade():
    op.execute("TRUNCATE TABLE score_delegation")
    op.execute("TRUNCATE TABLE gitcoin_passport_stamps")


def downgrade():
    pass
