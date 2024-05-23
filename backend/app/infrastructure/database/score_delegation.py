from app.infrastructure.database.models import ScoreDelegation


def save_delegation(
    primary_addr_hash: str, secondary_addr_hash: str, both_addr_hash: str
):
    delegation_primary = ScoreDelegation(hashed_addr=primary_addr_hash)
    delegation_secondary = ScoreDelegation(hashed_addr=secondary_addr_hash)
    delegation_both = ScoreDelegation(hashed_addr=both_addr_hash)

    delegation_primary.add()
    delegation_secondary.add()
    delegation_both.add()


def get_all_delegations() -> list[ScoreDelegation]:
    return ScoreDelegation.query.all()
