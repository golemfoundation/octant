"""E9: Truncate existing delegations and GP stamps

Revision ID: b5d0a4e49513
Revises: 6c3af63d69f8
Create Date: 2025-10-03 11:50:46.030800

"""
from alembic import op


revision = "b5d0a4e49513"
down_revision = "6c3af63d69f8"
branch_labels = None
depends_on = None


def upgrade():
    op.execute("TRUNCATE TABLE score_delegation")
    op.execute("TRUNCATE TABLE gitcoin_passport_stamps")


def downgrade():
    pass
