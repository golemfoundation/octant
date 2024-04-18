from app.engine.octant_rewards.matched import MatchedRewards, MatchedRewardsPayload
from dataclasses import dataclass
from decimal import Decimal


@dataclass
class PercentageMatchedRewards(MatchedRewards):
    MATCHED_REWARDS_PERCENT: Decimal

    def calculate_matched_rewards(self, payload: MatchedRewardsPayload) -> int:
        return int(self.MATCHED_REWARDS_PERCENT * payload.staking_proceeds)
