from app.v2.engine.user.effective_deposit import TimebasedWithoutUnlocksWeights
from app.v2.engine.user.effective_deposit.weighted_average.weights.timebased import (
    DepositWeightsPayload,
    WeightedDeposit,
)
from tests.conftest import USER1_ADDRESS

from tests.helpers.mock_events_generator import (
    MockEventGeneratorFactory,
)

EPOCH_START = 123
EPOCH_END = 323
EPOCH_DURATION = EPOCH_END - EPOCH_START

EVENT_GENERATOR_FACTORY = MockEventGeneratorFactory(EPOCH_START, EPOCH_END)


def create_payload(
    deposits, epoch_start=EPOCH_START, epoch_end=EPOCH_END
) -> DepositWeightsPayload:
    generator = EVENT_GENERATOR_FACTORY.build(
        {USER1_ADDRESS: deposits}, epoch_start=epoch_start, epoch_end=epoch_end
    )
    events = generator.get_user_events(USER1_ADDRESS)
    return DepositWeightsPayload(epoch_start, epoch_end, events)


def test_computes_weighted_deposit_for_none_events():
    deposits = []
    payload = create_payload(deposits)
    uut = TimebasedWithoutUnlocksWeights()

    result = uut.calculate_deposit_weights(payload)

    assert result == []


def test_computes_weighted_deposit_for_one_event():
    deposits = [(EPOCH_START, 100)]
    payload = create_payload(deposits)
    uut = TimebasedWithoutUnlocksWeights()

    result = uut.calculate_deposit_weights(payload)

    assert result == [WeightedDeposit(100, 200)]


def test_computes_weighted_deposit_for_two_events():
    deposits = [(EPOCH_START, 100), (EPOCH_START + 50, -20)]
    payload = create_payload(deposits)
    uut = TimebasedWithoutUnlocksWeights()

    result = uut.calculate_deposit_weights(payload)

    assert result == [WeightedDeposit(80, EPOCH_DURATION)]


def test_weights_sum_up_to_epoch_duration():
    deposits = [(EPOCH_START, 100), (EPOCH_START + 50, -20)]
    payload = create_payload(deposits)
    uut = TimebasedWithoutUnlocksWeights()

    result = uut.calculate_deposit_weights(payload)

    assert sum([wd.weight for wd in result]) == EPOCH_DURATION


def test_computes_user_deposits_when_deposited_during_epoch():
    deposits = [(EPOCH_START + 17, 100)]
    payload = create_payload(deposits)
    uut = TimebasedWithoutUnlocksWeights()

    result = uut.calculate_deposit_weights(payload)

    assert result == [
        WeightedDeposit(0, 17),
        WeightedDeposit(100, EPOCH_DURATION - 17),
    ]


def test_computes_user_deposits_when_unlocked_at_epoch_beginning():
    deposits = [(EPOCH_START, 100), (EPOCH_START, -100)]
    payload = create_payload(deposits)
    uut = TimebasedWithoutUnlocksWeights()

    result = uut.calculate_deposit_weights(payload)

    assert result == [WeightedDeposit(0, EPOCH_DURATION)]


def test_computes_user_deposits_when_unlocked_all():
    deposits = [(EPOCH_START, 100), (EPOCH_START + 100, -100)]
    payload = create_payload(deposits)
    uut = TimebasedWithoutUnlocksWeights()

    result = uut.calculate_deposit_weights(payload)

    assert result == [WeightedDeposit(0, EPOCH_DURATION)]


def test_computes_user_deposits_when_unlocked():
    deposits = [(EPOCH_START, 100), (EPOCH_START + 150, -90)]
    payload = create_payload(deposits)
    uut = TimebasedWithoutUnlocksWeights()

    result = uut.calculate_deposit_weights(payload)

    assert result == [
        WeightedDeposit(10, EPOCH_DURATION),
    ]


def test_computes_user_deposits_for_a_sequence_of_locks_and_unlocks():
    deposits = [
        (EPOCH_START + 10, 100),
        (EPOCH_START + 12, -90),
        (EPOCH_START + 12, 1000),
        (EPOCH_START + 50, -1000),
        (EPOCH_START + 70, -9),
        (EPOCH_START + 120, 1000),
        (EPOCH_START + 120, 1000),
        (EPOCH_START + 160, 1500),
        (EPOCH_START + 180, -1),
    ]
    payload = create_payload(deposits)
    uut = TimebasedWithoutUnlocksWeights()

    result = uut.calculate_deposit_weights(payload)

    assert result == [
        WeightedDeposit(0, 10),
        WeightedDeposit(2001, 40),
        WeightedDeposit(3500, 40),
        WeightedDeposit(1, 110),
    ]
    assert sum([wd.weight for wd in result]) == EPOCH_DURATION


def test_many_locks_and_unlocks_scenario():
    deposits = [
        (0, 5000),
        (100, 5000),
        (300, -2000),
        (500, 1000),
        (800, -3500),
        (1000, 6000),
    ]
    payload = create_payload(deposits, epoch_start=0, epoch_end=1000)
    uut = TimebasedWithoutUnlocksWeights()

    result = uut.calculate_deposit_weights(payload)

    assert result == [
        WeightedDeposit(5000, 100),
        WeightedDeposit(5500, 900),
    ]


def test_repetitive_locks():
    deposits = [
        (100, 1000),
        (200, 1000),
        (300, 1000),
        (400, 1000),
        (500, 1000),
        (600, 1000),
        (700, 1000),
        (800, 1000),
        (900, 1000),
        (1000, 1000),
    ]
    payload = create_payload(deposits, epoch_start=0, epoch_end=1000)
    uut = TimebasedWithoutUnlocksWeights()

    result = uut.calculate_deposit_weights(payload)

    assert result == [
        WeightedDeposit(0, 100),
        WeightedDeposit(1000, 100),
        WeightedDeposit(2000, 100),
        WeightedDeposit(3000, 100),
        WeightedDeposit(4000, 100),
        WeightedDeposit(5000, 100),
        WeightedDeposit(6000, 100),
        WeightedDeposit(7000, 100),
        WeightedDeposit(8000, 100),
        WeightedDeposit(9000, 100),
    ]


def test_repetitive_locks_with_unlock_in_the_middle():
    deposits = [
        (100, 1000),
        (200, 1000),
        (300, 1000),
        (400, 2000),
        (500, -2000),
        (600, 1000),
        (700, 1000),
        (800, 1000),
        (900, 1000),
        (1000, 1000),
    ]
    payload = create_payload(deposits, epoch_start=0, epoch_end=1000)
    uut = TimebasedWithoutUnlocksWeights()

    result = uut.calculate_deposit_weights(payload)

    assert result == [
        WeightedDeposit(0, 100),
        WeightedDeposit(1000, 100),
        WeightedDeposit(2000, 100),
        WeightedDeposit(4000, 100),
        WeightedDeposit(5000, 100),
        WeightedDeposit(6000, 100),
        WeightedDeposit(7000, 100),
        WeightedDeposit(3000, 300),
    ]
