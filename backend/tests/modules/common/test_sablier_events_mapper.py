from typing import Dict

import pytest

from app.engine.user.effective_deposit import SablierEventType, DepositSource
from app.infrastructure.sablier.events import SablierStream
from app.modules.common.sablier_events_mapper import (
    process_to_locks_and_unlocks,
    MappedEvents,
    SablierEvent,
    flatten_sablier_events,
    FlattenStrategy,
)


@pytest.fixture
def sample_streams():
    return [
        MappedEvents(
            locks=[
                SablierEvent(
                    __source=DepositSource.OCTANT,
                    depositBefore=100,
                    amount=50,
                    timestamp=123456789,
                    user="user1",
                    transactionHash="tx1",
                    type=SablierEventType.CREATE,
                ),
                SablierEvent(
                    __source=DepositSource.SABLIER,
                    depositBefore=200,
                    amount=75,
                    timestamp=123456790,
                    user="user2",
                    transactionHash="tx2",
                    type=SablierEventType.WITHDRAW,
                ),
            ],
            unlocks=[
                SablierEvent(
                    __source=DepositSource.OCTANT,
                    depositBefore=300,
                    amount=25,
                    timestamp=123456791,
                    user="user3",
                    transactionHash="tx3",
                    type=SablierEventType.CANCEL,
                )
            ],
        ),
        MappedEvents(
            locks=[
                SablierEvent(
                    __source=DepositSource.SABLIER,
                    depositBefore=150,
                    amount=60,
                    timestamp=123456792,
                    user="user4",
                    transactionHash="tx4",
                    type=SablierEventType.CREATE,
                )
            ],
            unlocks=[
                SablierEvent(
                    __source=DepositSource.OCTANT,
                    depositBefore=250,
                    amount=30,
                    timestamp=123456793,
                    user="user5",
                    transactionHash="tx5",
                    type=SablierEventType.CANCEL,
                ),
                SablierEvent(
                    __source=DepositSource.SABLIER,
                    depositBefore=350,
                    amount=40,
                    timestamp=123456794,
                    user="user6",
                    transactionHash="tx6",
                    type=SablierEventType.WITHDRAW,
                ),
            ],
        ),
    ]


def create_action(
    category: str, timestamp: int, amountA: int = 0, amountB: int = 0
) -> Dict:
    return {
        "category": category,
        "addressA": "0xSender",
        "addressB": "0xReceiver",
        "amountA": amountA,
        "amountB": amountB,
        "timestamp": timestamp,
        "hash": f"hash_{timestamp}",
    }


def test_empty_actions():
    sablier_streams = [SablierStream(actions=[], intactAmount=0)]
    result = process_to_locks_and_unlocks(sablier_streams)[0]
    assert len(result.locks) == 0
    assert len(result.unlocks) == 0


def test_create_action():
    action = create_action(SablierEventType.CREATE, timestamp=100, amountA=100)
    sablier_streams = [SablierStream(actions=[action], intactAmount=0)]
    result = process_to_locks_and_unlocks(sablier_streams)[0]

    assert len(result.locks) == 1
    assert len(result.unlocks) == 0
    lock = result.locks[0]
    assert lock["amount"] == 100
    assert lock["__typename"] == "Locked"
    assert lock["depositBefore"] == 0
    assert lock["__source"] == "Sablier"


def test_withdraw_action():
    create_action_item = create_action(
        SablierEventType.CREATE, timestamp=100, amountA=200
    )
    withdraw_action_item = create_action(
        SablierEventType.WITHDRAW, timestamp=200, amountB=50
    )
    sablier_streams = [
        SablierStream(
            actions=[create_action_item, withdraw_action_item],
            intactAmount=0,
        )
    ]
    result = process_to_locks_and_unlocks(sablier_streams)[0]

    assert len(result.locks) == 1
    assert len(result.unlocks) == 1

    lock = result.locks[0]
    assert lock["amount"] == 200
    assert lock["depositBefore"] == 0
    assert lock["__source"] == "Sablier"

    unlock = result.unlocks[0]
    assert unlock["amount"] == 50
    assert unlock["__typename"] == "Unlocked"
    assert unlock["depositBefore"] == 200
    assert unlock["__source"] == "Sablier"


def test_cancel_action():
    create_action_item = create_action(
        SablierEventType.CREATE, timestamp=100, amountA=150
    )
    cancel_action_item = create_action(
        SablierEventType.CANCEL, timestamp=300, amountA=150, amountB=0
    )
    sablier_streams = [
        SablierStream(
            actions=[create_action_item, cancel_action_item],
            intactAmount=0,
        )
    ]
    result = process_to_locks_and_unlocks(sablier_streams)[0]

    assert len(result.locks) == 1
    assert len(result.unlocks) == 1

    lock = result.locks[0]
    assert lock["amount"] == 150
    assert lock["depositBefore"] == 0
    assert lock["__source"] == "Sablier"

    unlock = result.unlocks[0]
    assert unlock["amount"] == 150
    assert unlock["__typename"] == "Unlocked"
    assert unlock["depositBefore"] == 150
    assert unlock["__source"] == "Sablier"


def test_mixed_actions():
    actions = [
        create_action(SablierEventType.CREATE, timestamp=100, amountA=100),
        create_action(SablierEventType.WITHDRAW, timestamp=150, amountB=50),
        create_action(SablierEventType.CREATE, timestamp=200, amountA=200),
        create_action(SablierEventType.CANCEL, timestamp=250, amountA=150, amountB=50),
    ]
    sablier_streams = [SablierStream(actions=actions, intactAmount=0)]

    result = process_to_locks_and_unlocks(sablier_streams)[0]

    assert len(result.locks) == 2
    assert len(result.unlocks) == 2

    lock1 = result.locks[0]
    assert lock1["amount"] == 100
    assert lock1["__typename"] == "Locked"
    assert lock1["depositBefore"] == 0
    assert lock1["__source"] == "Sablier"

    unlock1 = result.unlocks[0]
    assert unlock1["amount"] == 50
    assert unlock1["__typename"] == "Unlocked"
    assert unlock1["depositBefore"] == 100
    assert unlock1["__source"] == "Sablier"

    lock2 = result.locks[1]
    assert lock2["amount"] == 200
    assert lock2["__typename"] == "Locked"
    assert lock2["depositBefore"] == 50
    assert lock2["__source"] == "Sablier"

    unlock2 = result.unlocks[1]
    assert unlock2["amount"] == 150
    assert unlock2["__typename"] == "Unlocked"
    assert unlock2["depositBefore"] == 250
    assert unlock2["__source"] == "Sablier"


def test_flatten_events_locks(sample_streams):
    result = flatten_sablier_events(sample_streams, FlattenStrategy.LOCKS)
    assert result == [
        sample_streams[0].locks[0],
        sample_streams[0].locks[1],
        sample_streams[1].locks[0],
    ], "Should return only locks"


def test_flatten_events_unlocks(sample_streams):
    result = flatten_sablier_events(sample_streams, FlattenStrategy.UNLOCKS)
    assert result == [
        sample_streams[0].unlocks[0],
        sample_streams[1].unlocks[0],
        sample_streams[1].unlocks[1],
    ], "Should return only unlocks"


def test_flatten_events_all(sample_streams):
    result = flatten_sablier_events(sample_streams, FlattenStrategy.ALL)

    expected_result = [
        sample_streams[0].locks[0],
        sample_streams[0].locks[1],
        sample_streams[0].unlocks[0],
        sample_streams[1].locks[0],
        sample_streams[1].unlocks[0],
        sample_streams[1].unlocks[1],
    ]

    assert (
        result == expected_result
    ), "Should return locks and unlocks in the order of each MappedEvents object"


def test_flatten_events_empty_stream():
    result = flatten_sablier_events([], FlattenStrategy.ALL)
    assert result == [], "Should return an empty list for an empty input stream"


def test_flatten_events_no_locks(sample_streams):
    for event in sample_streams:
        event.locks = []
    result = flatten_sablier_events(sample_streams, FlattenStrategy.LOCKS)
    assert result == [], "Should return an empty list when there are no locks"


def test_flatten_events_no_unlocks(sample_streams):
    for event in sample_streams:
        event.unlocks = []
    result = flatten_sablier_events(sample_streams, FlattenStrategy.UNLOCKS)
    assert result == [], "Should return an empty list when there are no unlocks"
