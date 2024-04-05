from app.engine.octant_rewards.total_and_individual import (
    TotalAndAllIndividualRewards,
    TotalAndAllIndividualPayload,
)
from decimal import Decimal
from dataclasses import dataclass


@dataclass
class PercentTotalAndAllIndividualRewards(TotalAndAllIndividualRewards):
    TR_PERCENT: Decimal

    def calculate_total_rewards(self, payload: TotalAndAllIndividualPayload) -> int:
        return int(payload.eth_proceeds * self.TR_PERCENT)

    def calculate_all_individual_rewards(
        self, payload: TotalAndAllIndividualPayload
    ) -> int:
        return int(payload.eth_proceeds * payload.locked_ratio)
