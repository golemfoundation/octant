from app.modules.common.sablier_events_mapper import process_to_locks_and_unlocks
from app.engine.user.effective_deposit import SablierEventType
from typing import Dict


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
    sablier_stream = {"actions": [], "intactAmount": 0}
    result = process_to_locks_and_unlocks(sablier_stream)
    assert len(result.locks) == 0
    assert len(result.unlocks) == 0


def test_create_action():
    action = create_action(SablierEventType.CREATE, timestamp=100, amountA=100)
    sablier_stream = {"actions": [action], "intactAmount": 0}
    result = process_to_locks_and_unlocks(sablier_stream)

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
    sablier_stream = {
        "actions": [create_action_item, withdraw_action_item],
        "intactAmount": 0,
    }
    result = process_to_locks_and_unlocks(sablier_stream)

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
        SablierEventType.CANCEL, timestamp=300, amountA=150, amountB=50
    )
    sablier_stream = {
        "actions": [create_action_item, cancel_action_item],
        "intactAmount": 0,
    }
    result = process_to_locks_and_unlocks(sablier_stream)

    assert len(result.locks) == 1
    assert len(result.unlocks) == 1

    lock = result.locks[0]
    assert lock["amount"] == 150
    assert lock["depositBefore"] == 0
    assert lock["__source"] == "Sablier"

    unlock = result.unlocks[0]
    assert unlock["amount"] == 100
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
    sablier_stream = {"actions": actions, "intactAmount": 0}

    result = process_to_locks_and_unlocks(sablier_stream)

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
    assert unlock2["amount"] == 100
    assert unlock2["__typename"] == "Unlocked"
    assert unlock2["depositBefore"] == 250
    assert unlock2["__source"] == "Sablier"
