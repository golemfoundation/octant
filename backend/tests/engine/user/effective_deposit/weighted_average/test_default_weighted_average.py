from app.constants import ZERO_ADDRESS
from app.engine.user.effective_deposit import (
    UserEffectiveDepositPayload,
    UserDeposit,
)
from app.engine.user.effective_deposit.cut_off.cutoff_100glm import CutOff100GLM
from app.engine.user.effective_deposit.weighted_average.weights.timebased.default import (
    DefaultTimebasedWeights,
)
from app.engine.user.effective_deposit.weighted_average.default import (
    DefaultWeightedAverageEffectiveDeposit,
)
from tests.helpers.constants import USER1_ADDRESS, USER2_ADDRESS
from tests.helpers.mock_events_generator import MockEventGeneratorFactory

EPOCH_START = 123
EPOCH_END = 323
EPOCH_DURATION = EPOCH_END - EPOCH_START
EVENT_GENERATOR_FACTORY = MockEventGeneratorFactory()


def create_payload(
    deposits, epoch_start=EPOCH_START, epoch_end=EPOCH_END
) -> UserEffectiveDepositPayload:
    generator = EVENT_GENERATOR_FACTORY.build(deposits)
    events = generator.get_all_users_events()
    return UserEffectiveDepositPayload(epoch_start, epoch_end, events)


def test_empty_deposits():
    deposits = {}
    payload = create_payload(deposits)
    uut = DefaultWeightedAverageEffectiveDeposit()

    result = uut.calculate_users_effective_deposits(payload)

    assert result[0] == []
    assert result[1] == 0


def test_user_with_empty_events():
    events = {USER1_ADDRESS: []}
    payload = UserEffectiveDepositPayload(EPOCH_START, EPOCH_END, events)
    uut = DefaultWeightedAverageEffectiveDeposit()

    result = uut.calculate_users_effective_deposits(payload)

    assert result[0] == [UserDeposit(USER1_ADDRESS, 0, 0)]
    assert result[1] == 0


def test_lock_0GLM():
    deposits = {USER1_ADDRESS: [(EPOCH_START, 0)]}
    payload = create_payload(deposits)
    uut = DefaultWeightedAverageEffectiveDeposit()

    result = uut.calculate_users_effective_deposits(payload)

    assert result[0] == [UserDeposit(USER1_ADDRESS, 0, 0)]
    assert result[1] == 0


def test_lock_and_unlock_everything():
    deposits = {
        USER1_ADDRESS: [
            (EPOCH_START, 100_000000000_000000000),
            (EPOCH_START + 50, -100_000000000_000000000),
        ]
    }
    payload = create_payload(deposits)
    uut = DefaultWeightedAverageEffectiveDeposit()

    result = uut.calculate_users_effective_deposits(payload)

    assert result[0] == [UserDeposit(USER1_ADDRESS, 0, 0)]
    assert result[1] == 0


def test_one_user_deposit_at_the_beginning_of_an_epoch():
    deposits = {USER1_ADDRESS: [(EPOCH_START, 100_000000000_000000000)]}
    payload = create_payload(deposits)
    uut = DefaultWeightedAverageEffectiveDeposit()

    result = uut.calculate_users_effective_deposits(payload)

    assert result[0] == [
        UserDeposit(USER1_ADDRESS, 100_000000000_000000000, 100_000000000_000000000)
    ]
    assert result[1] == 100_000000000_000000000


def test_user_with_zero_address():
    deposits = {ZERO_ADDRESS: [(EPOCH_START, 100_000000000_000000000)]}
    payload = create_payload(deposits)
    uut = DefaultWeightedAverageEffectiveDeposit()

    result = uut.calculate_users_effective_deposits(payload)

    assert result[0] == [
        UserDeposit(ZERO_ADDRESS, 100_000000000_000000000, 100_000000000_000000000)
    ]
    assert result[1] == 100_000000000_000000000


def test_one_user_deposit_below_locked_amount_cutoff():
    deposits = {USER1_ADDRESS: [(EPOCH_START, 90_000000000_000000000)]}
    payload = create_payload(deposits)
    uut = DefaultWeightedAverageEffectiveDeposit()

    result = uut.calculate_users_effective_deposits(payload)

    assert result[0] == [UserDeposit(USER1_ADDRESS, 0, 90_000000000_000000000)]
    assert result[1] == 0


def test_one_user_deposit_below_effective_deposit_10glm_cutoff():
    deposits = {USER1_ADDRESS: [(EPOCH_START + 190, 100_000000000_000000000)]}
    payload = create_payload(deposits)
    uut = DefaultWeightedAverageEffectiveDeposit()

    result = uut.calculate_users_effective_deposits(payload)

    assert result[0] == [UserDeposit(USER1_ADDRESS, 0, 100_000000000_000000000)]
    assert result[1] == 0


def test_one_user_deposit_below_effective_deposit_100glm_cutoff():
    deposits = {USER1_ADDRESS: [(EPOCH_START, 90_000000000_000000000)]}
    payload = create_payload(deposits)
    uut = DefaultWeightedAverageEffectiveDeposit(cut_off=CutOff100GLM())

    result = uut.calculate_users_effective_deposits(payload)

    assert result[0] == [UserDeposit(USER1_ADDRESS, 0, 90_000000000_000000000)]
    assert result[1] == 0


def test_one_user_deposit_above_effective_deposit_100glm_cutoff():
    deposits = {
        USER1_ADDRESS: [
            (EPOCH_START, 1000_000000000_000000000),
            (EPOCH_START + 190, -950_000000000_000000000),
        ]
    }
    payload = create_payload(deposits)
    uut = DefaultWeightedAverageEffectiveDeposit(
        timebased_weights=DefaultTimebasedWeights(), cut_off=CutOff100GLM()
    )

    result = uut.calculate_users_effective_deposits(payload)

    assert result[0] == [
        UserDeposit(USER1_ADDRESS, 952_500000000_000000000, 50_000000000_000000000)
    ]
    assert result[1] == 952_500000000_000000000


def test_user_deposits_cumulative_locks():
    deposits = {
        USER1_ADDRESS: [
            (EPOCH_START, 100_000000000_000000000),
            (EPOCH_START + 100, 200_000000000_000000000),
        ]
    }
    payload = create_payload(deposits)
    uut = DefaultWeightedAverageEffectiveDeposit()

    result = uut.calculate_users_effective_deposits(payload)

    assert result[0] == [
        UserDeposit(USER1_ADDRESS, 200_000000000_000000000, 300_000000000_000000000)
    ]
    assert result[1] == 200_000000000_000000000


def test_user_deposits_with_locks_and_unlocks():
    deposits = {
        USER1_ADDRESS: [
            (EPOCH_START, 200_000000000_000000000),
            (EPOCH_START + 100, -100_000000000_000000000),
            (EPOCH_START + 150, 200_000000000_000000000),
        ]
    }
    payload = create_payload(deposits)
    uut = DefaultWeightedAverageEffectiveDeposit()

    result = uut.calculate_users_effective_deposits(payload)

    assert result[0] == [
        UserDeposit(USER1_ADDRESS, 150_000000000_000000000, 300_000000000_000000000)
    ]
    assert result[1] == 150_000000000_000000000


def test_user_deposits_with_locks_and_unlocks_and_default_timebased_weights():
    deposits = {
        USER1_ADDRESS: [
            (EPOCH_START, 200_000000000_000000000),
            (EPOCH_START + 100, -100_000000000_000000000),
            (EPOCH_START + 150, 200_000000000_000000000),
        ]
    }
    payload = create_payload(deposits)
    uut = DefaultWeightedAverageEffectiveDeposit(
        timebased_weights=DefaultTimebasedWeights()
    )

    result = uut.calculate_users_effective_deposits(payload)

    assert result[0] == [
        UserDeposit(USER1_ADDRESS, 200_000000000_000000000, 300_000000000_000000000)
    ]
    assert result[1] == 200_000000000_000000000


def test_multiple_users_deposits_timebased_without_unlocks():
    deposits = {
        USER1_ADDRESS: [
            (EPOCH_START, 200_000000000_000000000),
            (EPOCH_START + 100, -100_000000000_000000000),
            (EPOCH_START + 150, 200_000000000_000000000),
        ],
        USER2_ADDRESS: [
            (EPOCH_START, 1000_000000000_000000000),
            (EPOCH_START + 100, 100_000000000_000000000),
            (EPOCH_START + 150, 2000_000000000_000000000),
        ],
    }
    payload = create_payload(deposits)
    uut = DefaultWeightedAverageEffectiveDeposit()

    result = uut.calculate_users_effective_deposits(payload)

    assert result[0] == [
        UserDeposit(USER1_ADDRESS, 150_000000000_000000000, 300_000000000_000000000),
        UserDeposit(USER2_ADDRESS, 1550_000000000_000000000, 3100_000000000_000000000),
    ]
    assert result[1] == 1700_000000000_000000000


def test_multiple_users_deposits_default_timebased():
    deposits = {
        USER1_ADDRESS: [
            (EPOCH_START, 200_000000000_000000000),
            (EPOCH_START + 100, -100_000000000_000000000),
            (EPOCH_START + 150, 200_000000000_000000000),
        ],
        USER2_ADDRESS: [
            (EPOCH_START, 1000_000000000_000000000),
            (EPOCH_START + 100, 100_000000000_000000000),
            (EPOCH_START + 150, 2000_000000000_000000000),
        ],
    }
    payload = create_payload(deposits)
    uut = DefaultWeightedAverageEffectiveDeposit(
        timebased_weights=DefaultTimebasedWeights()
    )

    result = uut.calculate_users_effective_deposits(payload)

    assert result[0] == [
        UserDeposit(USER1_ADDRESS, 200_000000000_000000000, 300_000000000_000000000),
        UserDeposit(USER2_ADDRESS, 1550_000000000_000000000, 3100_000000000_000000000),
    ]
    assert result[1] == 1750_000000000_000000000
