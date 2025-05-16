def calculate_leftover(
    ppf: int,
    total_matched_rewards: int,
    used_matched_rewards: int,
    total_withdrawals: int,
    staking_proceeds: int,
    operational_cost: int,
    community_fund: int,
) -> int:
    return (
        staking_proceeds
        - operational_cost
        - community_fund
        - int(ppf / 2)  # extra individual rewards
        - total_withdrawals
        + (total_matched_rewards - used_matched_rewards)  # unused matched rewards
    )
