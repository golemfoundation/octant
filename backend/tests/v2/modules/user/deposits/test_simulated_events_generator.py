from app.v2.modules.user.deposits.events_generator import SimulatedEventsGenerator


def test_get_user_event_for_epoch_lock_duration_equals_remaining():
    generator = SimulatedEventsGenerator(1000, 2000)
    generator.create_user_events(250_000000000_000000000, 500, 500)

    result = generator.get_user_events()

    assert len(result) == 1
    assert result[0]["__typename"] == "Locked"
    assert result[0]["depositBefore"] == 0
    assert result[0]["amount"] == 250_000000000_000000000
    assert result[0]["timestamp"] == 1500


def test_get_user_event_for_epoch_lock_duration_bigger_than_remaining():
    generator = SimulatedEventsGenerator(1000, 2000)
    generator.create_user_events(250_000000000_000000000, 1000, 500)

    result = generator.get_user_events()

    assert len(result) == 1
    assert result[0]["__typename"] == "Locked"
    assert result[0]["depositBefore"] == 0
    assert result[0]["amount"] == 250_000000000_000000000
    assert result[0]["timestamp"] == 1500


def test_get_user_event_for_epoch_lock_duration_less_than_remaining():
    generator = SimulatedEventsGenerator(1000, 2000)
    generator.create_user_events(250_000000000_000000000, 250, 500)

    result = generator.get_user_events()

    assert len(result) == 2
    assert result[0]["__typename"] == "Locked"
    assert result[0]["depositBefore"] == 0
    assert result[0]["amount"] == 250_000000000_000000000
    assert result[0]["timestamp"] == 1500

    assert result[1]["__typename"] == "Unlocked"
    assert result[1]["depositBefore"] == 250_000000000_000000000
    assert result[1]["amount"] == 250_000000000_000000000
    assert result[1]["timestamp"] == 1750
