"""Soft delete allocations for selected users

Revision ID: 976c7c2adb0f
Revises: 6ab87f7762d8
Create Date: 2025-01-15 09:44:48.635057

"""
from alembic import op
import sqlalchemy as sa
from eth_utils import to_checksum_address

# revision identifiers, used by Alembic.
revision = "976c7c2adb0f"
down_revision = "6ab87f7762d8"
branch_labels = None
depends_on = None


def upgrade():
    epoch = 6
    addresses = [
        "0x33878e070db7f70d2953fe0278cd32adf8104572",
        "0x094b75eedf58a83af4d37694b7532691fb26570e"
    ]
    # INFO: remember to checksum addresses :)
    checksum_addresses = [
       to_checksum_address(address) for address in addresses
    ]

    soft_delete_allocations_query = """\
        UPDATE allocations 
        SET deleted_at = CURRENT_TIMESTAMP 
        WHERE epoch = :epoch 
        AND user_id IN (SELECT id FROM users WHERE address IN :addresses)
        AND deleted_at IS NULL;
    """

    delete_uniqueness_quotients_query = """\
        DELETE FROM uniqueness_quotients 
        WHERE epoch = :epoch 
        AND user_id IN (SELECT id FROM users WHERE address IN :addresses);
    """

    session = op.get_context().bind

    session.execute(
        sa.text(soft_delete_allocations_query),
        {"epoch": epoch, "addresses": tuple(checksum_addresses)}
    )
    session.execute(
        sa.text(delete_uniqueness_quotients_query),
        {"epoch": epoch, "addresses": tuple(checksum_addresses)}
    )

    session.commit()


def downgrade():
    # We don't downgrade this migration
    pass
