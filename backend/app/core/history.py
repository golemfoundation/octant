from app.infrastructure.graphql_client import get_locks, get_unlocks


def get_history(user_address):
    locks = [
        {"type": "lock", "timestamp": lock["blockTimestamp"], "amount": lock["amount"]}
        for lock in get_locks(user_address)
    ]
    unlocks = [
        {
            "type": "unlock",
            "timestamp": unlock["blockTimestamp"],
            "amount": unlock["amount"],
        }
        for unlock in get_unlocks(user_address)
    ]

    return sorted(locks + unlocks, key=lambda x: x["timestamp"])
