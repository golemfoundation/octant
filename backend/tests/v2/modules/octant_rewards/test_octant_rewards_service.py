from decimal import Decimal
from unittest.mock import Mock

import pytest

from app.context.context import ContextBuilder
from app.v2.modules.octant_rewards.service.octant_rewards import OctantRewardsService
from tests.conftest import MOCK_EPOCHS, TOTAL_ED, ETH_PROCEEDS


@pytest.fixture(autouse=True)
def before(app, patch_epochs, mock_epoch_details):
    pass


@pytest.mark.parametrize(
    "epoch,total_expected,individual_expected",
    [
        (1, 321_928767123_288000000, 101_814368807_786772948),
        (2, 127_267961009_733466185, 40_250230619_178123337),
        (3, 127_267961009_733466185, 40_250230619_178123337),
    ],
)
def test_get_rewards_in_pending_epoch(
    epoch,
    total_expected,
    individual_expected,
):
    MOCK_EPOCHS.get_pending_epoch.return_value = epoch
    staking_proceeds_service_mock = Mock()
    staking_proceeds_service_mock.get_withdrawals_target_balance.return_value = (
        ETH_PROCEEDS
    )
    context = ContextBuilder().with_pending_epoch_context().build()
    service = OctantRewardsService(staking_proceeds_service_mock)

    result = service.get_rewards(context.pending_epoch_context, TOTAL_ED)

    assert result.eth_proceeds == ETH_PROCEEDS
    assert result.locked_ratio == Decimal("0.100022700000000000099999994")
    assert result.total_rewards == total_expected
    assert result.all_individual_rewards == individual_expected
