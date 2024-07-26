"""remove broken pending multisig signature

Revision ID: 794a553631fc
Revises: 5d3bf271b78d
Create Date: 2024-07-26 14:53:10.119386

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = "794a553631fc"
down_revision = "5d3bf271b78d"
branch_labels = None
depends_on = None


def upgrade():
    query = "DELETE FROM multisig_signatures WHERE id = 11 AND address = '0xBc6d82D8d6632938394905Bb0217Ad9c673015d1' AND msg_hash = '0x5bdc8268d93443907367c847537b3605f12d7640189a2c1e257880def3fed3fc'"
    op.execute(query)


def downgrade():
    pass
