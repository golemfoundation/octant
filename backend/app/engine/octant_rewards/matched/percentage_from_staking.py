from app.engine.octant_rewards.matched import MatchedRewards, MatchedRewardsPayload
from dataclasses import dataclass
from decimal import Decimal

from app.exceptions import InvalidMatchedRewardsStrategy


@dataclass
class PercentageMatchedRewards(MatchedRewards):
    MATCHED_REWARDS_PERCENT: Decimal

    def calculate_matched_rewards(self, payload: MatchedRewardsPayload) -> int:
        if payload.locked_ratio > payload.tr_percent:
            raise InvalidMatchedRewardsStrategy()

        if payload.locked_ratio < payload.ire_percent:
            return int(
                self.MATCHED_REWARDS_PERCENT * payload.staking_proceeds
                + payload.patrons_rewards
            )
        elif payload.ire_percent <= payload.locked_ratio < payload.tr_percent:
            return int(
                (payload.tr_percent - payload.locked_ratio) * payload.staking_proceeds
                + payload.patrons_rewards
            )
        return payload.patrons_rewards
