from copy import deepcopy
from dataclasses import dataclass
from typing import List, TypedDict, Literal

from app.engine.user.effective_deposit import (
    SablierEventType,
    DepositSource,
    EventType,
)
from app.infrastructure.sablier.events import SablierStream, SablierAction


class SablierEvent(TypedDict):
    __source: DepositSource
    depositBefore: int
    amount: int
    timestamp: int
    user: str
    transactionHash: str
    type: SablierEventType


class SablierEventLock(SablierEvent):
    __typename: Literal["Locked"]


class SablierEventUnlock(SablierEvent):
    __typename: Literal["Unlocked"]


@dataclass
class MappedEvents:
    locks: List[SablierEvent]
    unlocks: List[SablierEvent]


def process_to_locks_and_unlocks(
    sablier_stream: SablierStream,
    *,
    from_timestamp: int = None,
    to_timestamp: int = None,
    inclusively: bool = False,
) -> MappedEvents:
    """
    Returns TypedDict with locks and unlocks from Sablier stream.
    """
    if len(sablier_stream["actions"]) == 0:
        return MappedEvents(locks=[], unlocks=[])

    event_items = _convert(sablier_stream["actions"])
    lock_items_with_filters = _apply_filters(
        event_items,
        from_timestamp=from_timestamp,
        to_timestamp=to_timestamp,
        inclusively=inclusively,
    )

    return MappedEvents(
        locks=list(
            filter(
                lambda lock: lock["__typename"] == EventType.LOCK,
                lock_items_with_filters,
            )
        ),
        unlocks=list(
            filter(
                lambda lock: lock["__typename"] == EventType.UNLOCK,
                lock_items_with_filters,
            )
        ),
    )


def _apply_filters(
    event_items: List[SablierEvent],
    *,
    from_timestamp: int,
    to_timestamp: int,
    inclusively: bool,
) -> List[SablierEvent]:
    copy_event_items = deepcopy(event_items)

    if inclusively is True:
        to_timestamp += 1

    for item in event_items:
        if from_timestamp and item["timestamp"] < from_timestamp:
            copy_event_items.remove(item)
        if to_timestamp and item["timestamp"] > to_timestamp:
            copy_event_items.remove(item)

    return copy_event_items


def _process_create(action, starting_deposit):
    amount = int(action["amountA"]) if action["amountA"] else 0
    deposit_before = starting_deposit
    starting_deposit += amount
    lock_item = SablierEventLock(
        __source=DepositSource.SABLIER,
        __typename=EventType.LOCK.value,
        amount=amount,
        timestamp=int(action["timestamp"]),
        transactionHash=action["hash"],
        depositBefore=deposit_before,
        user=action["addressB"],
        type=SablierEventType.CREATE,
    )
    return lock_item, starting_deposit


def _process_withdraw(action, starting_deposit):
    amount = int(action["amountB"]) if action["amountB"] else 0
    deposit_before = starting_deposit
    starting_deposit -= amount  # Withdraw subtracts from deposit
    lock_item = SablierEventUnlock(
        __source=DepositSource.SABLIER,
        __typename=EventType.UNLOCK.value,
        amount=amount,
        timestamp=int(action["timestamp"]),
        transactionHash=action["hash"],
        depositBefore=deposit_before,
        user=action["addressB"],
        type=SablierEventType.WITHDRAW,
    )
    return lock_item, starting_deposit


def _process_cancel(action, starting_deposit):
    intact_amount = int(action["amountB"]) if action["amountB"] else 0
    cancelled_amount = int(action["amountA"]) - intact_amount
    deposit_before = starting_deposit
    starting_deposit = intact_amount
    lock_item = SablierEventUnlock(
        __source=DepositSource.SABLIER,
        __typename=EventType.UNLOCK.value,
        amount=cancelled_amount,
        timestamp=int(action["timestamp"]),
        transactionHash=action["hash"],
        depositBefore=deposit_before,
        user=action["addressB"],
        type=SablierEventType.CANCEL,
    )
    return lock_item, starting_deposit


def _convert(actions: List[SablierAction]) -> List[SablierEvent]:
    lock_items = []
    action_strategy = {
        SablierEventType.CREATE.value: _process_create,
        SablierEventType.WITHDRAW.value: _process_withdraw,
        SablierEventType.CANCEL.value: _process_cancel,
    }
    starting_deposit = 0

    for action in actions:
        category = action["category"]
        if category in action_strategy:
            process_func = action_strategy[category]
            lock_item, starting_deposit = process_func(action, starting_deposit)
            lock_items.append(lock_item)

    return lock_items
