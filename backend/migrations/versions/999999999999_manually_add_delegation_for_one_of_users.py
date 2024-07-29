"""Manually add delegation for one of the users

Revision ID: 999999999999
Revises: 794a553631fc
Create Date: 2024-07-17 16:48:12.133033

"""
import json
from alembic import op

revision = "999999999999"
down_revision = "794a553631fc"
branch_labels = None
depends_on = None

user_id = 14424
# values of hashes below were obtained using code above; with appropriately set DELEGATION_SALT and DELEGATION_SALT_PRIMARY envs
hash1 = "a1ee927c11efc35ffef40fa51547e0770df76aab9085da332311ac9d629fa518"
hash2 = "f6b78725294faab4442f38aedb97ff7bc8fcaf9d73edf9845e1c57496e6d2913"
hash3 = "93bf4d5bb695b96edd45c0d4eae59fe3f5ecc657f7137407288fd82834476a0b"


def upgrade():
    query = f"INSERT INTO score_delegation (hashed_addr) VALUES ('{hash1}');"
    op.execute(query)
    query = f"INSERT INTO score_delegation (hashed_addr) VALUES ('{hash2}');"
    op.execute(query)
    query = f"INSERT INTO score_delegation (hashed_addr) VALUES ('{hash3}');"
    op.execute(query)

    # since sqlite doesn't support conditional inserts that well...
    if op.get_bind().engine.name == "sqlite":
        return

    query = """
      INSERT INTO uniqueness_quotients (user_id, epoch, score)
      SELECT 14424, 4, '1.0'
      WHERE EXISTS (SELECT id FROM users WHERE id = 14424);
    """
    minimal_stamps = {
        "items": [
            {
                "version": "1.0.0",
                "credential": {
                    "expirationDate": "2099-09-22T15:04:05.073Z",
                    "credentialSubject": {"provider": "AllowList#OctantEpochTwo"},
                },
            }
        ]
    }
    query = f"INSERT INTO gitcoin_passport_stamps (user_id, score, expires_at, stamps) SELECT 14424, '41.037', '2024-10-14T00:00:01.000000', '{json.dumps(minimal_stamps)}' WHERE EXISTS (SELECT id FROM users WHERE id = 14424);"
    op.execute(query)


def downgrade():
    query = f"DELETE FROM gitcoin_passport_stamps WHERE user_id = 14424;"
    op.execute(query)
    query = f"DELETE FROM uniqueness_quotients WHERE user_id = 14424"
    op.execute(query)
    query = f"DELETE FROM score_delegation WHERE hashed_addr in ('{hash1}', '{hash2}', '{hash3}');"
    op.execute(query)
