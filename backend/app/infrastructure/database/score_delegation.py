from app.infrastructure.database.models import ScoreDelegation


def does_delegation_exist(hashed_addr: str) -> bool:
    delegation = ScoreDelegation.query.filter_by(hashed_addr=hashed_addr).first()

    return delegation is not None


def save_delegation(
    primary_addr_hash: str, secondary_addr_hash: str, both_addr_hash: str
):
    delegation_primary = ScoreDelegation(hashed_addr=primary_addr_hash)
    delegation_secondary = ScoreDelegation(hashed_addr=secondary_addr_hash)
    delegation_both = ScoreDelegation(hashed_addr=both_addr_hash)

    delegation_primary.save()
    delegation_secondary.save()
    delegation_both.save()


def get_all_delegations():
    return ScoreDelegation.query.all()
