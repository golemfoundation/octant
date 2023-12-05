from app.v2.engine.octant_rewards.total_and_individual import (
    TotalAndAllIndividualPayload,
    TotalAndAllIndividualRewards,
)


class DefaultTotalAndIndividualRewards(TotalAndAllIndividualRewards):
    def calculate_total_rewards(self, payload: TotalAndAllIndividualPayload) -> int:
        return int(payload.eth_proceeds * payload.locked_ratio.sqrt())

    def calculate_all_individual_rewards(
        self, payload: TotalAndAllIndividualPayload
    ) -> int:
        return int(payload.eth_proceeds * payload.locked_ratio)
