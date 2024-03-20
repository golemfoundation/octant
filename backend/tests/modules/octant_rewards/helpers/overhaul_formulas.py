from decimal import Decimal


def ppf(staking_proceeds: int) -> int:
    return int(Decimal("0.35") * staking_proceeds)


def community_fund(staking_proceeds: int) -> int:
    return int(Decimal("0.05") * staking_proceeds)


def total_rewards(staking_proceeds: int) -> int:
    return int(Decimal("0.7") * staking_proceeds)


def matched_rewards(total_rewards: int, ppf: int, patrons_rewards: int) -> int:
    return total_rewards - ppf + patrons_rewards
