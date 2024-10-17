from copy import deepcopy
from dataclasses import dataclass
from typing import List, TypedDict

from app.infrastructure.sablier.events import SablierStream
from app.modules.history.dto import OpType


class SablierEvents:
    CREATE = "Create"
    WITHDRAW = "Withdraw"
    CANCEL = "Cancel"


class SablierEvent(TypedDict):
    type: str
    amount: int
    timestamp: int
    transaction_hash: str
    deposit_before: int


@dataclass
class MappedEvents:
    locks: List[SablierEvent]
    unlocks: List[SablierEvent]


def process_to_locks_and_unlocks(
    sablier_stream: SablierStream,
    *,
    from_timestamp: int = None,
    to_timestamp: int = None,
    inclusively: bool = False
) -> MappedEvents:
    """
    Returns TypedDict with locks and unlocks from Sablier stream.
    """
    if not sablier_stream:
        return MappedEvents(locks=[], unlocks=[])

    lock_items = _convert(sablier_stream["actions"])

    lock_items_with_filters = _apply_filters(
        lock_items, from_timestamp, to_timestamp, inclusively
    )

    return MappedEvents(
        locks=list(
            filter(lambda lock: lock["type"] == OpType.LOCK, lock_items_with_filters)
        ),
        unlocks=list(
            filter(lambda lock: lock["type"] == OpType.UNLOCK, lock_items_with_filters)
        ),
    )


def _apply_filters(
    lock_items: List[SablierEvent],
    from_timestamp: int,
    to_timestamp: int,
    inclusively: bool,
) -> List[SablierEvent]:
    copy_lock_items = deepcopy(lock_items)

    if inclusively is True:
        to_timestamp += 1

    for item in lock_items:
        if from_timestamp and item["timestamp"] < from_timestamp:
            copy_lock_items.remove(item)
        if to_timestamp and item["timestamp"] > to_timestamp:
            copy_lock_items.remove(item)

    return copy_lock_items


def _process_create(action, starting_deposit):
    amount = int(action["amountA"]) if action["amountA"] else 0
    deposit_before = starting_deposit
    starting_deposit += amount  # Create adds to deposit
    lock_item = SablierEvent(
        type=OpType.LOCK,
        amount=amount,
        timestamp=int(action["timestamp"]),
        transaction_hash=action["hash"],
        deposit_before=deposit_before,
    )
    return lock_item, starting_deposit


def _process_withdraw(action, starting_deposit):
    amount = int(action["amountB"]) if action["amountB"] else 0
    deposit_before = starting_deposit
    starting_deposit -= amount  # Withdraw subtracts from deposit
    lock_item = SablierEvent(
        type=OpType.UNLOCK,
        amount=amount,
        timestamp=int(action["timestamp"]),
        transaction_hash=action["hash"],
        deposit_before=deposit_before,
    )
    return lock_item, starting_deposit


def _process_cancel(action, starting_deposit):
    amount = (
        int(action["amountB"]) if action["amountB"] else 0
    )  # AmountB represents the intactAmount
    deposit_before = starting_deposit
    starting_deposit = amount  # Cancel sets deposit to a specific value
    lock_item = SablierEvent(
        type=OpType.UNLOCK,
        amount=amount,
        timestamp=int(action["timestamp"]),
        transaction_hash=action["hash"],
        deposit_before=deposit_before,
    )
    return lock_item, starting_deposit


def _convert(actions) -> List[SablierEvent]:
    lock_items = []
    action_strategy = {
        SablierEvents.CREATE: _process_create,
        SablierEvents.WITHDRAW: _process_withdraw,
        SablierEvents.CANCEL: _process_cancel,
    }
    starting_deposit = 0

    for action in actions:
        category = action["category"]
        if category in action_strategy:
            process_func = action_strategy[category]
            lock_item, starting_deposit = process_func(action, starting_deposit)
            lock_items.append(lock_item)

    return lock_items
