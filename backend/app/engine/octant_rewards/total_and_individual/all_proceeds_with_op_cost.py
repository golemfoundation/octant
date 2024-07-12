from app.engine.octant_rewards.total_and_individual import (
    TotalAndAllIndividualRewards,
    TotalAndAllIndividualPayload,
)


class AllProceedsWithOperationalCost(TotalAndAllIndividualRewards):
    def calculate_total_rewards(self, payload: TotalAndAllIndividualPayload) -> int:
        return int(payload.eth_proceeds - payload.operational_cost)

    def calculate_vanilla_individual_rewards(
        self, payload: TotalAndAllIndividualPayload
    ) -> int:
        total_rewards = self.calculate_total_rewards(payload)
        return int(payload.locked_ratio.sqrt() * total_rewards)
