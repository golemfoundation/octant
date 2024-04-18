from decimal import Decimal


def ire(staking_proceeds: int) -> int:
    """
    Individual Rewards Equilibrium
    """
    return int(Decimal("0.35") * staking_proceeds)


def ppf(staking_proceeds: int, individual_rewards: int) -> int:
    return ire(staking_proceeds) - individual_rewards


def community_fund(staking_proceeds: int) -> int:
    return int(Decimal("0.05") * staking_proceeds)


def total_rewards(staking_proceeds: int) -> int:
    return int(Decimal("0.7") * staking_proceeds)
