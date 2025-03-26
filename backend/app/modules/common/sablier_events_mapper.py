from copy import deepcopy
from dataclasses import dataclass
from typing import List, TypedDict, Literal, Tuple

from app.engine.user.effective_deposit import (
    SablierEventType,
    DepositSource,
    EventType,
)
from app.infrastructure.sablier.events import SablierStream, SablierAction


class FlattenStrategy:
    LOCKS = 0
    UNLOCKS = 1
    ALL = 2


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
    sablier_streams: List[SablierStream],
    *,
    from_timestamp: int = None,
    to_timestamp: int = None,
    inclusively: bool = False,
) -> List[MappedEvents]:
    """
    Returns TypedDict with locks and unlocks from Sablier stream.
    We assume that the sender sends GLMs only to eligible users.
    """
    if len(sablier_streams) == 0:
        return [MappedEvents(locks=[], unlocks=[])]

    mapped_streams = []
    for sablier_stream in sablier_streams:
        event_items = _convert(sablier_stream["actions"])
        lock_items_with_filters = _apply_filters(
            event_items,
            from_timestamp=from_timestamp,
            to_timestamp=to_timestamp,
            inclusively=inclusively,
        )

        mapped_streams.append(
            MappedEvents(
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
        )
    return mapped_streams


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


def _process_create(
    action: SablierAction, starting_deposit: int
) -> Tuple[SablierEvent, int]:
    amount = int(action["amountA"])
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


def _process_withdraw(
    action: SablierAction, starting_deposit: int
) -> Tuple[SablierEvent, int]:
    amount = int(action["amountB"])
    deposit_before = starting_deposit
    starting_deposit -= amount
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


def _process_transfer(
    action: SablierAction, starting_deposit: int
) -> Tuple[SablierEvent, int]:
    """
    The logic is needed for invalidly created streams that were set as transferable.
    The logic is exactly the same as for withdraw. We don't track the recipient with their locks.
    """
    lock_item, starting_deposit = _process_withdraw(action, starting_deposit)
    lock_item["type"] = SablierEventType.TRANSFER
    lock_item["user"] = action["addressA"]
    return lock_item, starting_deposit


def _process_cancel(
    action: SablierAction, starting_deposit: int
) -> Tuple[SablierEvent, int]:
    intact_amount = int(action["amountB"])
    cancelled_amount = int(action["amountA"])
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
        SablierEventType.TRANSFER.value: _process_transfer,
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


def flatten_sablier_events(
    streams: List[MappedEvents], flatten_strategy: FlattenStrategy
):
    output = []
    for mapped_events in streams:
        if flatten_strategy == FlattenStrategy.LOCKS:
            output += mapped_events.locks
        elif flatten_strategy == FlattenStrategy.UNLOCKS:
            output += mapped_events.unlocks
        elif flatten_strategy == FlattenStrategy.ALL:
            output += mapped_events.locks + mapped_events.unlocks

    return output
