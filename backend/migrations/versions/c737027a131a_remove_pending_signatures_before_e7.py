"""Remove pending signatures before E7

Revision ID: c737027a131a
Revises: e27e85614385
Create Date: 2025-02-04 10:57:25.254950

"""
from alembic import op

revision = "c737027a131a"
down_revision = "e27e85614385"
branch_labels = None
depends_on = None


def upgrade():
    op.execute(
        """
            DELETE FROM multisig_signatures
            WHERE status = 'pending'
              AND created_at <= '2025-02-04';
        """
    )


def downgrade():
    pass
