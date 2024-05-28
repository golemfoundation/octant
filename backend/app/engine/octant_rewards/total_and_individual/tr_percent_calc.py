from dataclasses import dataclass

from app.engine.octant_rewards.total_and_individual import (
    TotalAndAllIndividualRewards,
    TotalAndAllIndividualPayload,
)


@dataclass
class PercentTotalAndAllIndividualRewards(TotalAndAllIndividualRewards):
    def calculate_total_rewards(self, payload: TotalAndAllIndividualPayload) -> int:
        return int(self.TR_PERCENT * payload.eth_proceeds)

    def calculate_vanilla_individual_rewards(
        self, payload: TotalAndAllIndividualPayload
    ) -> int:
        return int(payload.eth_proceeds * payload.locked_ratio)

    def calculate_individual_rewards_equilibrium(
        self, payload: TotalAndAllIndividualPayload
    ) -> int:
        return int(self.IRE_PERCENT * payload.eth_proceeds)
