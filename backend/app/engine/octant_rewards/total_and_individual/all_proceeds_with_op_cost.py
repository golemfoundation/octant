from decimal import Decimal

from app.engine.octant_rewards.total_and_individual import (
    TotalAndAllIndividualRewards,
    TotalAndAllIndividualPayload,
)

FOUNDATION_OPERATIONAL_COST_PERCENT = Decimal("0.2")


class AllProceedsWithOperationalCost(TotalAndAllIndividualRewards):
    def calculate_total_rewards(self, payload: TotalAndAllIndividualPayload) -> int:
        operational_cost = int(
            payload.eth_proceeds * FOUNDATION_OPERATIONAL_COST_PERCENT
        )
        return int(payload.eth_proceeds - operational_cost)

    def calculate_all_individual_rewards(
        self, payload: TotalAndAllIndividualPayload
    ) -> int:
        total_rewards = self.calculate_total_rewards(payload)
        return int(payload.locked_ratio.sqrt() * total_rewards)
