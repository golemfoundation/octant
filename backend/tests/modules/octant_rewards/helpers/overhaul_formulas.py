from decimal import Decimal


IRE_PERCENT = Decimal("0.35")
MATCHED_REWARDS_PERCENT = Decimal("0.35")
TR_PERCENT = Decimal("0.7")


def ire(staking_proceeds: int) -> int:
    """
    Individual Rewards Equilibrium
    """
    return int(Decimal("0.35") * staking_proceeds)


def ppf(
    staking_proceeds: int, vanilla_individual_rewards: int, locked_ratio: Decimal
) -> int:
    if locked_ratio < Decimal("0.35"):
        return ire(staking_proceeds) - vanilla_individual_rewards
    return 0


def community_fund(staking_proceeds: int) -> int:
    return int(Decimal("0.05") * staking_proceeds)


def total_rewards(staking_proceeds: int) -> int:
    return int(Decimal("0.7") * staking_proceeds)


def matched_rewards(
    staking_proceeds: int, locked_ratio: Decimal, patrons_rewards: int
) -> int:
    if locked_ratio < IRE_PERCENT:
        return int(MATCHED_REWARDS_PERCENT * staking_proceeds + patrons_rewards)
    elif IRE_PERCENT <= locked_ratio < TR_PERCENT:
        return int((TR_PERCENT - locked_ratio) * staking_proceeds + patrons_rewards)
    return patrons_rewards
