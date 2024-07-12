from app.engine.octant_rewards.total_and_individual import (
    TotalAndAllIndividualRewards,
    TotalAndAllIndividualPayload,
)


class PreliminaryTotalAndAllIndividualRewards(TotalAndAllIndividualRewards):
    def calculate_total_rewards(self, payload: TotalAndAllIndividualPayload) -> int:
        return int(payload.eth_proceeds * payload.locked_ratio.sqrt())

    def calculate_vanilla_individual_rewards(
        self, payload: TotalAndAllIndividualPayload
    ) -> int:
        return int(payload.eth_proceeds * payload.locked_ratio)
