"""Fix created_at field

Revision ID: 8b425b454a86
Revises: 999999999999
Create Date: 2024-08-02 12:32:50.490759

"""
from alembic import op
import sqlalchemy as sa

revision = "8b425b454a86"
down_revision = "999999999999"
branch_labels = None
depends_on = None

HASH1 = "a1ee927c11efc35ffef40fa51547e0770df76aab9085da332311ac9d629fa518"
HASH2 = "f6b78725294faab4442f38aedb97ff7bc8fcaf9d73edf9845e1c57496e6d2913"
HASH3 = "93bf4d5bb695b96edd45c0d4eae59fe3f5ecc657f7137407288fd82834476a0b"


def upgrade():
    query = f"UPDATE score_delegation SET created_at = make_date(2024, 7, 17) WHERE hashed_addr IN ('{HASH1}', '{HASH2}', '{HASH3}');"
    op.execute(query)


def downgrade():
    query = f"UPDATE score_delegation SET created_at = NULL WHERE hashed_addr IN ('{HASH1}', '{HASH2}', '{HASH3}');"
    op.execute(query)
