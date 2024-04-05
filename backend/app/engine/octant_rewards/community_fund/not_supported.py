from app.engine.octant_rewards.community_fund import (
    CommunityFundCalculator,
    CommunityFundPayload,
)
from dataclasses import dataclass


@dataclass
class NotSupportedCFCalculator(CommunityFundCalculator):
    def calculate_cf(self, payload: CommunityFundPayload) -> None:
        return None
