"""E8: Truncate existing delegations and gp stamps

Revision ID: bfd76a2b13a8
Revises: 2a2ced0a6aa7
Create Date: 2025-07-07 16:38:48.361977

"""
from alembic import op


# revision identifiers, used by Alembic.
revision = "bfd76a2b13a8"
down_revision = "2a2ced0a6aa7"
branch_labels = None
depends_on = None


def upgrade():
    op.execute("TRUNCATE TABLE score_delegation")
    op.execute("TRUNCATE TABLE gitcoin_passport_stamps")


def downgrade():
    pass
