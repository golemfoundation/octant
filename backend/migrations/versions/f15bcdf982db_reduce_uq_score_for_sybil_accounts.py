"""Reduce UQ score for sybil accounts

Revision ID: f15bcdf982db
Revises: 976c7c2adb0f
Create Date: 2025-01-16 15:48:12.488871

"""
from alembic import op
import sqlalchemy as sa
from eth_utils import to_checksum_address


# revision identifiers, used by Alembic.
revision = "f15bcdf982db"
down_revision = "976c7c2adb0f"
branch_labels = None
depends_on = None


def upgrade():
    epoch = 6
    addresses = [
        "0xf3ad97364bccc3ea0582ede58c363888f8c4ec85",
        "0xbaba775a0400a5e442335ceaa4820edb1ded8f73",
        "0x9dcba70b2dfe5807e2a847e065ebb666791f8b8a",
        "0x63b1efc5602c0023bbb373f2350cf34c2e5f8669",
        "0xa64f2228ccec96076c82abb903021c33859082f8",
        "0x8073639b11994c549eda58fc3cd7132a72aadf10",
        "0x4d5b28d08e8c00e041053b0dc584e00e6997daa3",
        "0xe862e2c1ca94eacfede3c95a217c15ef0086a29d",
        "0x8682bddfb5fd9484a0a19a85ca4274caa084106d",
        "0x9f000bfb33b0b63fce685b538b1a8af079b57d93",
        # Testing address
        "0xd0a7c12f82bf981009a1f1cc525d64c123002ba0",
    ]
    # INFO: remember to checksum addresses :)
    checksum_addresses = [to_checksum_address(address) for address in addresses]

    nullify_uq_scores_query = """\
        UPDATE uniqueness_quotients
        SET score = '0'
        WHERE epoch = :epoch 
        AND user_id IN (SELECT id FROM users WHERE address IN :addresses);
    """

    session = op.get_context().bind

    session.execute(
        sa.text(nullify_uq_scores_query),
        {"epoch": epoch, "addresses": tuple(checksum_addresses)},
    )

    session.commit()

def downgrade():
    pass
