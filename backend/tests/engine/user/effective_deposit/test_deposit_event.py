from app.engine.user.effective_deposit import DepositEvent, EventType


def test_deposit_event_lock():
    event = DepositEvent(
        user=None, type=EventType.LOCK, timestamp=1000, amount=100, deposit_before=200
    )

    assert event.type == EventType.LOCK
    assert event.timestamp == 1000
    assert event.amount == 100
    assert event.deposit_before == 200
    assert event.deposit_after == 300


def test_deposit_event_unlock():
    event = DepositEvent(
        user=None, type=EventType.UNLOCK, timestamp=1000, amount=100, deposit_before=200
    )

    assert event.type == EventType.UNLOCK
    assert event.timestamp == 1000
    assert event.amount == 100
    assert event.deposit_before == 200
    assert event.deposit_after == 100
