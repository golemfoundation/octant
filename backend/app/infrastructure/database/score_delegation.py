from app.extensions import db
from app.infrastructure.database.models import ScoreDelegation


def save_delegation(
    primary_addr_hash: str, secondary_addr_hash: str, both_addr_hash: str
):
    delegation_primary = ScoreDelegation(hashed_addr=primary_addr_hash)
    delegation_secondary = ScoreDelegation(hashed_addr=secondary_addr_hash)
    delegation_both = ScoreDelegation(hashed_addr=both_addr_hash)

    db.session.add(delegation_primary)
    db.session.add(delegation_secondary)
    db.session.add(delegation_both)


def get_all_delegations() -> set[str]:
    return {s.hashed_addr for s in ScoreDelegation.query.all()}
