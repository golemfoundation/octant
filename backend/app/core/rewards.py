from decimal import Decimal


def calculate_total_rewards(eth_proceeds: int, staked_ratio: Decimal) -> int:
    return int(eth_proceeds * staked_ratio.sqrt())


def calculate_all_individual_rewards(eth_proceeds: int, staked_ratio: Decimal) -> int:
    return int(eth_proceeds * staked_ratio)
