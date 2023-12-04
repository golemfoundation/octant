from decimal import Decimal


class DoubleRewardsStrategy:
    DOUBLING_GLM_SUPPLY_LIMIT = 0.25
    REWARDS_MULTIPLY_RATIO_LIMIT = 0.5
    REWARDS_MULTIPLY_FACTOR = 2

    def calculate_total_rewards(self, eth_proceeds: int, locked_ratio: Decimal) -> int:
        if locked_ratio < self.DOUBLING_GLM_SUPPLY_LIMIT:
            return (
                int(eth_proceeds * locked_ratio.sqrt()) * self.REWARDS_MULTIPLY_FACTOR
            )
        else:
            return eth_proceeds

    def calculate_all_individual_rewards(
        self, eth_proceeds: int, locked_ratio: Decimal
    ) -> int:
        if locked_ratio < self.DOUBLING_GLM_SUPPLY_LIMIT:
            return int(eth_proceeds * locked_ratio) * self.REWARDS_MULTIPLY_FACTOR
        else:
            return int(eth_proceeds * self.REWARDS_MULTIPLY_RATIO_LIMIT)
