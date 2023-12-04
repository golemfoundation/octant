from decimal import Decimal


class DefaultRewardsStrategy:
    def calculate_total_rewards(self, eth_proceeds: int, locked_ratio: Decimal) -> int:
        return int(eth_proceeds * locked_ratio.sqrt())

    def calculate_all_individual_rewards(
        self, eth_proceeds: int, locked_ratio: Decimal
    ) -> int:
        return int(eth_proceeds * locked_ratio)
