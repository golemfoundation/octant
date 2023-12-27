import pytest

from app.v2.context.builder import ContextBuilder
from app.v2.engine.user.effective_deposit import UserDeposit
from app.v2.modules.user.budgets.service.service import UserBudgetsCalculator
from tests.conftest import MOCK_EPOCHS, TOTAL_ED, ALL_INDIVIDUAL_REWARDS


@pytest.fixture(autouse=True)
def before(app, patch_epochs, mock_epoch_details):
    pass


@pytest.mark.parametrize(
    "epoch,alice_expected,bob_expected",
    [
        (1, 274836_407916427, 2839976_215136415),
        (2, 274836_407916427, 2839976_215136415),
        (3, 274836_407916427, 2839976_215136415),
    ],
)
def test_get_effective_deposits_in_pending_epoch(
    epoch, alice_expected, bob_expected, alice, bob
):
    MOCK_EPOCHS.get_pending_epoch.return_value = epoch
    deposits = [
        UserDeposit(alice.address, 270_000000000_000000000, 300_000000000_000000000),
        UserDeposit(bob.address, 2790_000000000_000000000, 3100_000000000_000000000),
    ]
    context = ContextBuilder().with_pending_epoch_context().build()
    service = UserBudgetsCalculator()
    result = service.calculate_budgets(
        context.pending_epoch_context, deposits, TOTAL_ED, ALL_INDIVIDUAL_REWARDS
    )

    assert len(result) == 2
    assert result[0][0] == alice.address
    assert result[0][1] == alice_expected
    assert result[1][0] == bob.address
    assert result[1][1] == bob_expected
