from decimal import Decimal

import pytest

from app.engine.epochs_settings import register_epoch_settings
from app.modules.octant_rewards.general.service.calculated import (
    CalculatedOctantRewards,
)
from tests.conftest import ETH_PROCEEDS, TOTAL_ED
from tests.helpers.constants import MOCKED_EPOCH_NO_AFTER_OVERHAUL, LOCKED_RATIO
from tests.helpers.context import get_context
from tests.modules.octant_rewards.helpers import overhaul_formulas


@pytest.mark.parametrize(
    "epoch_nr, expected_ir, expected_tr, expected_operational_cost",
    [
        (1, 101_814368807_786772948, 321_928767123_288000000, 80_482191780_822000000),
        ([2, 40_250230619_178123337, 127267961009733466185, 10_060273972_6027500000]),
    ],
)
def test_calculate_octant_rewards_before_overhaul(
    mock_staking_proceeds,
    mock_user_deposits,
    epoch_nr,
    expected_ir,
    expected_tr,
    expected_operational_cost,
):
    register_epoch_settings()
    context = get_context(epoch_num=epoch_nr)
    service = CalculatedOctantRewards(
        staking_proceeds=mock_staking_proceeds, effective_deposits=mock_user_deposits
    )

    result = service.get_octant_rewards(context)

    assert result.staking_proceeds == ETH_PROCEEDS
    assert result.locked_ratio == Decimal("0.100022700000000000099999994")
    assert result.total_effective_deposit == TOTAL_ED
    assert result.total_rewards == expected_tr
    assert result.vanilla_individual_rewards == expected_ir
    assert result.operational_cost == expected_operational_cost
    assert result.donated_to_projects is None


def test_calculate_octant_rewards_after_overhaul(
    mock_staking_proceeds, mock_user_deposits
):
    register_epoch_settings()
    context = get_context(epoch_num=MOCKED_EPOCH_NO_AFTER_OVERHAUL)
    service = CalculatedOctantRewards(
        staking_proceeds=mock_staking_proceeds, effective_deposits=mock_user_deposits
    )

    result = service.get_octant_rewards(context)

    assert result.staking_proceeds == ETH_PROCEEDS
    assert result.locked_ratio == Decimal("0.100022700000000000099999994")
    assert result.total_effective_deposit == TOTAL_ED
    assert result.total_rewards == overhaul_formulas.total_rewards(
        result.staking_proceeds
    )

    assert result.vanilla_individual_rewards == 40_250230619_178123337
    assert result.operational_cost == 10_060273972_6027500000
    assert result.community_fund == overhaul_formulas.community_fund(
        result.staking_proceeds
    )
    assert result.ppf == overhaul_formulas.ppf(
        result.staking_proceeds, result.vanilla_individual_rewards, LOCKED_RATIO
    )
    assert result.donated_to_projects is None
