import pytest

from app.constants import EPOCH0_SYBILS
from app.extensions import db
from app.infrastructure import database
from app.infrastructure.database.claims import get_all


non_sybil_addresses = [
    "0x5754aC842D6eaF6a4E29101D46ac25D7C567311E",
    "0x76273DCC41356e5f0c49bB68e525175DC7e83417",
]


@pytest.fixture(autouse=True)
def before(app):
    for sybil in EPOCH0_SYBILS:
        database.claims.add_claim(sybil)
    for non_sybil in non_sybil_addresses:
        database.claims.add_claim(non_sybil)
    db.session.commit()


def test_get_all_excludes_sybils():
    all_claims = get_all(exclude_sybils=True)
    sybil_addresses = [
        "0xde19a6ce83cc934e5d4c4573f0f026c02c984fb2",
        "0x673bb40e274786dc58fd19fbbf9ffa1f903a2fd8",
    ]
    for claim in all_claims:
        assert claim.address.lower() not in sybil_addresses


def test_get_all_includes_non_sybils():
    all_claims = get_all()
    non_sybil_addresses = [
        "0x5754aC842D6eaF6a4E29101D46ac25D7C567311E",
        "0x76273DCC41356e5f0c49bB68e525175DC7e83417",
    ]
    found_addresses = [claim.address.lower() for claim in all_claims]
    for address in non_sybil_addresses:
        assert address.lower() in found_addresses
