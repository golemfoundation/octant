from app.engine.octant_rewards.matched.preliminary import PreliminaryMatchedRewards
from app.engine.octant_rewards.matched import MatchedRewardsPayload
from tests.helpers.constants import TOTAL_REWARDS, ALL_INDIVIDUAL_REWARDS


def test_preliminary_matched_rewards():
    patrons_budget = 1526868_989237987
    payload = MatchedRewardsPayload(
        TOTAL_REWARDS, ALL_INDIVIDUAL_REWARDS, patrons_budget
    )
    uut = PreliminaryMatchedRewards()

    result = uut.calculate_matched_rewards(payload)

    assert result == 220115925184490486394
