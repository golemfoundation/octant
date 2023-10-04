from decimal import Decimal

from app.core.rewards.rewards_strategy import RewardsStrategy

FOUNDATION_OPERATIONAL_COST_PERCENT = 0.2


class AllProceedsWithOperationalCostStrategy(RewardsStrategy):
    def calculate_total_rewards(self, eth_proceeds: int, locked_ratio: Decimal) -> int:
        operational_cost = eth_proceeds * FOUNDATION_OPERATIONAL_COST_PERCENT
        return int(eth_proceeds - operational_cost)

    def calculate_all_individual_rewards(
        self, eth_proceeds: int, locked_ratio: Decimal
    ) -> int:
        total_rewards = self.calculate_total_rewards(eth_proceeds, locked_ratio)
        return int(locked_ratio.sqrt() * total_rewards)
