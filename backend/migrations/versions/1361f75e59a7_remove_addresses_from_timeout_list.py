"""Remove addresses from timeout list (epoch6)

Revision ID: 1361f75e59a7
Revises: 976c7c2adb0f
Create Date: 2025-01-20 14:29:35.248940

"""
from alembic import op
import sqlalchemy as sa
from eth_utils import to_checksum_address


# revision identifiers, used by Alembic.
revision = "1361f75e59a7"
down_revision = "976c7c2adb0f"
branch_labels = None
depends_on = None


def upgrade():
    epoch = 6
    addresses = [
        "0x826976d7c600d45fb8287ca1d7c76fc8eb732030",
        "0x981e7512e87d2f7228d3f03b65950eb6a1b21bac",
        "0x1d921dff757610fbdb0073479e12c0a07d382677",
        "0xb6989f472bef8931e6ca882b1f875539b7d5da19",
        "0x774c3ccfde30a5e7263e8d8ec80b3d419c13ddd3",
        "0x5a1f55459c07432165a93eac188076d2ecbf6814",
        "0x87f64272eb089a14dc5764b848e3488710b829ea",
        "0x2f0642874d5651ba794f8e20774cf9452edc96e2",
    ]
    # INFO: remember to checksum addresses :)
    checksum_addresses = [to_checksum_address(address) for address in addresses]

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
        {"epoch": epoch, "addresses": tuple(checksum_addresses)},
    )
    session.execute(
        sa.text(delete_uniqueness_quotients_query),
        {"epoch": epoch, "addresses": tuple(checksum_addresses)},
    )

    session.commit()


def downgrade():
    # We don't downgrade this migration
    pass
