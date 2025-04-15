"""E7: remove stuck multisig-allocation request

Revision ID: 2a2ced0a6aa7
Revises: 7d5968807420
Create Date: 2025-04-15 10:27:44.341248

"""
from alembic import op


# revision identifiers, used by Alembic.
revision = "2a2ced0a6aa7"
down_revision = "7d5968807420"
branch_labels = None
depends_on = None


def upgrade():
    query = "DELETE FROM multisig_signatures WHERE id = 37 AND address = '0x25854e2a49A6CDAeC7f0505b4179834509038549' AND msg_hash = '0x8b4c12cb5bf3cd65331265011e4a8be45b35005fbc34692f20d52e0bb676fe57'"
    op.execute(query)


def downgrade():
    pass
