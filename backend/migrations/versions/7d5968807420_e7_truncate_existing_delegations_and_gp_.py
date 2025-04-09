"""E7: Truncate existing delegations and gp stamps

Revision ID: 7d5968807420
Revises: c737027a131a
Create Date: 2025-04-09 10:23:08.996921

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = "7d5968807420"
down_revision = "c737027a131a"
branch_labels = None
depends_on = None


def upgrade():
    op.execute("TRUNCATE TABLE score_delegation")
    op.execute("TRUNCATE TABLE gitcoin_passport_stamps")


def downgrade():
    pass
