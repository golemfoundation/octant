"""Update leftover for epoch 3

Revision ID: 19f6b4f5ce2e
Revises: 8ff293a1f737
Create Date: 2024-06-05 15:26:16.831567

"""

# revision identifiers, used by Alembic.
revision = "19f6b4f5ce2e"
down_revision = "2a2f8092d317"
branch_labels = None
depends_on = None

from alembic import op


def upgrade():
    op.execute(
        """
        UPDATE finalized_epoch_snapshots
        SET leftover = '3854465046588467390'
        WHERE epoch = 3
    """
    )


def downgrade():
    op.execute(
        """
        UPDATE finalized_epoch_snapshots
        SET leftover = '146492474466159601123'
        WHERE epoch = 3
    """
    )
