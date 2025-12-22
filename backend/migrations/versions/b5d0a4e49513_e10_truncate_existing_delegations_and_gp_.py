"""E10: Truncate existing delegations and GP stamps

Revision ID: e2f4c1a7b8d9
Revises: a1b2c3d4e5f6
Create Date: 2025-12-22 11:52:19.278824

"""
from alembic import op


revision = "e2f4c1a7b8d9"
down_revision = "a1b2c3d4e5f6"
branch_labels = None
depends_on = None


def upgrade():
    op.execute("TRUNCATE TABLE score_delegation")
    op.execute("TRUNCATE TABLE gitcoin_passport_stamps")


def downgrade():
    pass
