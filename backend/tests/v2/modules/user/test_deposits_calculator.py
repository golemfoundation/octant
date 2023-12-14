import pytest

from app.context.context import ContextBuilder
from app.v2.engine.user.effective_deposit import UserDeposit
from app.v2.modules.user.deposits.service import UserDepositsCalculator
from tests.conftest import MOCK_EPOCHS
from tests.helpers.mock_events_generator import (
    MockEventGeneratorFactory,
    MockEventGenerator,
)
from tests.helpers.mocked_epoch_details import EPOCH_EVENTS


@pytest.fixture(autouse=True)
def before(app, patch_epochs, mock_epoch_details):
    pass


def create_events_generator(epoch_start, epoch_end, deposits) -> MockEventGenerator:
    return MockEventGeneratorFactory(
        epoch_start=epoch_start, epoch_end=epoch_end
    ).build(deposits)


@pytest.mark.parametrize(
    "epoch,alice_expected,bob_expected",
    [
        (1, 280_000000000_000000000, 2790_000000000_000000000),
        (2, 270_000000000_000000000, 2790_000000000_000000000),
        (3, 270_000000000_000000000, 2790_000000000_000000000),
    ],
)
def test_get_budgets_in_pending_epoch(epoch, alice_expected, bob_expected, alice, bob):
    MOCK_EPOCHS.get_pending_epoch.return_value = epoch
    epoch_start = EPOCH_EVENTS[epoch]["fromTs"]
    epoch_end = EPOCH_EVENTS[epoch]["toTs"]

    deposits = {
        alice.address: [
            (epoch_start, 200_000000000_000000000),
            (epoch_start + 100, -100_000000000_000000000),
            (epoch_start + 150, 200_000000000_000000000),
        ],
        bob.address: [
            (epoch_start, 1000_000000000_000000000),
            (epoch_start + 100, 100_000000000_000000000),
            (epoch_start + 150, 2000_000000000_000000000),
        ],
    }
    generator = create_events_generator(epoch_start, epoch_end, deposits)
    context = ContextBuilder().with_pending_epoch_context().build()
    service = UserDepositsCalculator(generator)
    result = service.calculate_effective_deposits(context.pending_epoch_context)

    assert result[0] == [
        UserDeposit(alice.address, alice_expected, 300_000000000_000000000),
        UserDeposit(bob.address, bob_expected, 3100_000000000_000000000),
    ]
    assert result[1] == alice_expected + bob_expected
