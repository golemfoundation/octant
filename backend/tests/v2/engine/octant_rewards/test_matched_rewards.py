from app.v2.engine.octant_rewards import DefaultMatchedRewards
from app.v2.engine.octant_rewards.matched import MatchedRewardsPayload
from tests.conftest import TOTAL_REWARDS, ALL_INDIVIDUAL_REWARDS


def test_default_matched_rewards():
    patrons_budget = 1526868_989237987
    payload = MatchedRewardsPayload(
        TOTAL_REWARDS, ALL_INDIVIDUAL_REWARDS, patrons_budget
    )
    uut = DefaultMatchedRewards()

    result = uut.calculate_matched_rewards(payload)

    assert result == 220115925184490486394
