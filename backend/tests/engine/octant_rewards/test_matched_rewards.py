from decimal import Decimal

import pytest

from app.engine.octant_rewards.matched.preliminary import PreliminaryMatchedRewards
from app.engine.octant_rewards.matched import MatchedRewardsPayload
from app.engine.octant_rewards import (
    PercentageMatchedRewards,
    OctantRewardsDefaultValues,
)
from app.exceptions import InvalidMatchedRewardsStrategy
from tests.helpers.constants import (
    TOTAL_REWARDS,
    VANILLA_INDIVIDUAL_REWARDS,
    ETH_PROCEEDS,
    USER2_BUDGET,
)
from tests.modules.octant_rewards.helpers.overhaul_formulas import (
    IRE_PERCENT,
    TR_PERCENT,
)


def test_preliminary_matched_rewards():
    patrons_budget = 1526868_989237987
    payload = MatchedRewardsPayload(
        TOTAL_REWARDS, VANILLA_INDIVIDUAL_REWARDS, patrons_budget
    )
    uut = PreliminaryMatchedRewards()

    result = uut.calculate_matched_rewards(payload)

    assert result == 220115925184490486394


def test_matched_rewards_when_locked_ratio_greater_than_tr_percent():
    payload = MatchedRewardsPayload(
        staking_proceeds=ETH_PROCEEDS,
        patrons_rewards=USER2_BUDGET,
        locked_ratio=TR_PERCENT + Decimal("0.01"),
        ire_percent=IRE_PERCENT,
        tr_percent=TR_PERCENT,
    )

    uut = PercentageMatchedRewards(
        MATCHED_REWARDS_PERCENT=OctantRewardsDefaultValues.MATCHED_REWARDS_PERCENT
    )

    with pytest.raises(InvalidMatchedRewardsStrategy) as exc:
        uut.calculate_matched_rewards(payload)

        assert exc.value.status_code == 500
        assert (
            exc.value.description
            == "Can't calculate matched rewards when locked ratio is greater than TR percent"
        )
