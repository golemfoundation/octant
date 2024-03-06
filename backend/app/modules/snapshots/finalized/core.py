from app.modules.dto import OctantRewardsDTO


def calculate_leftover(octant_rewards: OctantRewardsDTO, total_withdrawals: int):
    return (
        octant_rewards.staking_proceeds
        - octant_rewards.operational_cost
        - total_withdrawals
    )
