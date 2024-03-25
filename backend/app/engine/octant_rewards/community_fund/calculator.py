from app.engine.octant_rewards.community_fund import (
    CommunityFundCalculator,
    CommunityFundPayload,
)
from decimal import Decimal
from dataclasses import dataclass


@dataclass
class CommunityFundPercent(CommunityFundCalculator):
    CF_PERCENT: Decimal

    def calculate_cf(self, payload: CommunityFundPayload) -> int:
        return int(self.CF_PERCENT * payload.eth_proceeds)
