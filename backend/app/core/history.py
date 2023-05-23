from app.infrastructure.qraphql.locks import get_locks_by_address
from app.infrastructure.qraphql.unlocks import get_unlocks_by_address


def get_history(user_address):
    return sorted(
        get_locks_by_address(user_address) + get_unlocks_by_address(user_address),
        key=lambda x: x["timestamp"],
    )
