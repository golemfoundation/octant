"""Manually add delegation for one of the users

Revision ID: 999999999999
Revises: 5d3bf271b78d
Create Date: 2024-07-17 16:48:12.133033

"""
import json
from alembic import op

revision = "999999999999"
down_revision = "5d3bf271b78d"
branch_labels = None
depends_on = None

# (hash1, hash2, hash3) = get_hashed_addresses(primary, secondary)
# values of hashes below were obtained using code above; with appropriately set DELEGATION_SALT and DELEGATION_SALT_PRIMARY envs
hash1 = "a4ed43527ceb61080a61e8661aa63fa7a266a313c08473db31fa1acafa32bd16"
hash2 = "772d00c482a244e447c8d460661b552fb9b06d58e7903f3bbfa4e0e14dd92b99"
hash3 = "fb610f25ff00d710de6578a2b684fdd2dcb353ed341e9f22a100af754ef36ae6"


def upgrade():
    query = f"INSERT INTO score_delegation (hashed_addr) VALUES ('{hash1}');"
    print(query, flush=True)
    op.execute(query)
    query = f"INSERT INTO score_delegation (hashed_addr) VALUES ('{hash2}');"
    print(query, flush=True)
    op.execute(query)
    query = f"INSERT INTO score_delegation (hashed_addr) VALUES ('{hash3}');"
    print(query, flush=True)
    op.execute(query)
    query = f"INSERT INTO uniqueness_quotients (user_id, epoch, score) VALUES (12812, 4, '1.0')"
    print(query, flush=True)
    op.execute(query)
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
    query = f"INSERT INTO gitcoin_passport_stamps (user_id, score, expires_at, stamps) VALUES (12812, '35.046', '2024-10-14T00:00:01.000000', '{json.dumps(minimal_stamps)}')"
    print(query, flush=True)
    op.execute(query)


def downgrade():
    query = f"DELETE FROM gitcoin_passport_stamps WHERE user_id = 12812;"
    print(query, flush=True)
    op.execute(query)
    query = f"DELETE FROM uniqueness_quotients WHERE user_id = 12812"
    print(query, flush=True)
    op.execute(query)
    query = f"DELETE FROM score_delegation WHERE hashed_addr in ('{hash1}', '{hash2}', '{hash3}');"
    print(query, flush=True)
    op.execute(query)
