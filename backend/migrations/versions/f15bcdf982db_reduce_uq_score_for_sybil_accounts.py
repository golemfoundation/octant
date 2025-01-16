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
        "0xF3Ad97364bcCC3eA0582Ede58C363888f8C4ec85",
        "0xbAba775A0400A5E442335CEaa4820eDb1DeD8f73",
        "0x9DCbA70B2dfe5807e2A847E065EBb666791F8b8A",
        "0x63b1EfC5602C0023BBb373F2350Cf34c2E5F8669",
        "0xA64f2228cceC96076c82abb903021C33859082F8",
        "0x8073639B11994C549eDa58fC3cd7132a72aaDF10",
        "0x4D5B28d08e8c00e041053b0dc584e00e6997Daa3",
        "0xe862e2c1ca94eacfede3c95a217c15ef0086a29d",
        "0x8682bddfb5fd9484a0a19a85ca4274caa084106d",
        "0x9f000bfb33b0b63fce685b538b1a8af079b57d93",
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
