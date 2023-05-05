from app.infrastructure.graphql_client import get_locks, get_unlocks


def get_history(user_address):
    locks = [{"type": "lock", **lock} for lock in get_locks(user_address)]
    unlocks = [{"type": "unlock", **unlock} for unlock in get_unlocks(user_address)]

    return sorted(locks + unlocks, key=lambda x: x['blockTimestamp'])
