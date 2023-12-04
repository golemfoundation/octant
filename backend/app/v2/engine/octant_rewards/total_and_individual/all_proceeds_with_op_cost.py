from decimal import Decimal

FOUNDATION_OPERATIONAL_COST_PERCENT = 0.2


class AllProceedsWithOperationalCostStrategy:
    def calculate_total_rewards(self, eth_proceeds: int) -> int:
        operational_cost = eth_proceeds * FOUNDATION_OPERATIONAL_COST_PERCENT
        return int(eth_proceeds - operational_cost)

    def calculate_all_individual_rewards(
        self, eth_proceeds: int, locked_ratio: Decimal
    ) -> int:
        total_rewards = self.calculate_total_rewards(eth_proceeds)
        return int(locked_ratio.sqrt() * total_rewards)
