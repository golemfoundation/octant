from . import locks, unlocks, epochs, info


def get_last_deposit_event(
    user_address: str, before: int
) -> locks.LockEvent | unlocks.UnlockEvent | None:
    lock = locks.get_last_lock_before(user_address=user_address, before=before)
    if lock is None:
        return None

    unlock = unlocks.get_last_unlock_before(user_address=user_address, before=before)
    if unlock is None:
        return lock

    return lock if lock["timestamp"] > unlock["timestamp"] else unlock
