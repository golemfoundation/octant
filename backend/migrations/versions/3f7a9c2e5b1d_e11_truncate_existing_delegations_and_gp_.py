"""E11: Truncate existing delegations and GP stamps

Revision ID: 3f7a9c2e5b1d
Revises: 8c5e2a1f4b7d
Create Date: 2026-02-03 13:32:19.124428

"""
from alembic import op


revision = "3f7a9c2e5b1d"
down_revision = "8c5e2a1f4b7d"
branch_labels = None
depends_on = None


def upgrade():
    op.execute("TRUNCATE TABLE score_delegation")
    op.execute("TRUNCATE TABLE gitcoin_passport_stamps")


def downgrade():
    pass
