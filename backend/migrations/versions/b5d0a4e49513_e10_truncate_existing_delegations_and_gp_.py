"""E10: Truncate existing delegations and GP stamps

Revision ID: e2f4c1a7b8d9
Revises: 40dec3f9c59c
Create Date: 2025-12-22 11:52:19.278824

"""
from alembic import op


revision = "e2f4c1a7b8d9"
down_revision = "40dec3f9c59c"
branch_labels = None
depends_on = None


def upgrade():
    op.execute("TRUNCATE TABLE score_delegation")
    op.execute("TRUNCATE TABLE gitcoin_passport_stamps")


def downgrade():
    pass
