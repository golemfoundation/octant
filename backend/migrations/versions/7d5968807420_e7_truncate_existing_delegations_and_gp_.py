"""E7: Truncate existing delegations and gp stamps

Revision ID: 7d5968807420
Revises: 998d6bb80951
Create Date: 2025-04-09 10:23:08.996921

"""
from alembic import op


revision = "7d5968807420"
down_revision = "998d6bb80951"
branch_labels = None
depends_on = None


def upgrade():
    op.execute("TRUNCATE TABLE score_delegation")
    op.execute("TRUNCATE TABLE gitcoin_passport_stamps")


def downgrade():
    pass
