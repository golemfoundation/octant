from app.database.models import PendingEpochSnapshot
from app.v2.context.context import (
    CurrentEpochContext,
    FutureEpochContext,
    OctantRewards,
)
from app.v2.modules.octant_rewards.service import OctantRewardsCalculator
from app.v2.modules.staking.proceeds.service import (
    EstimatedStakingProceeds,
    StakingProceedsPayload,
)
from app.v2.modules.user.deposits.events_generator import SubgraphEventsGenerator
from app.v2.modules.user.deposits.service import (
    UserDepositsReader,
    UserDepositsCalculator,
    UserDepositsEstimator,
)


def get_octant_rewards(snapshot: PendingEpochSnapshot):
    return (
        None
        if snapshot is None
        else OctantRewards(
            eth_proceeds=snapshot.eth_proceeds,
            locked_ratio=snapshot.locked_ratio,
            total_effective_deposit=snapshot.total_effective_deposit,
            total_rewards=snapshot.total_rewards,
            individual_rewards=snapshot.all_individual_rewards,
        )
    )


def get_current_octant_rewards(context: CurrentEpochContext):
    epoch_details = context.epoch_details
    start = epoch_details.start_sec
    end = epoch_details.end_sec

    staking_proceeds_calculator = EstimatedStakingProceeds()
    octant_rewards_calculator = OctantRewardsCalculator()
    event_generator = SubgraphEventsGenerator(epoch_start=start, epoch_end=end)
    user_deposits_calculator = UserDepositsCalculator(event_generator)
    user_deposits_estimator = UserDepositsEstimator(
        user_deposits_calculator=user_deposits_calculator,
    )
    staking_proceeds = staking_proceeds_calculator.get_staking_proceeds(
        StakingProceedsPayload(epoch_details.duration_sec)
    )
    total_effective_deposit = user_deposits_estimator.estimate_total_effective_deposit(
        context
    )
    rewards = octant_rewards_calculator.calculate_rewards(
        context.epoch_settings.octant_rewards, staking_proceeds, total_effective_deposit
    )

    return OctantRewards(
        eth_proceeds=staking_proceeds,
        locked_ratio=rewards.locked_ratio,
        total_effective_deposit=total_effective_deposit,
        total_rewards=rewards.total_rewards,
        individual_rewards=rewards.all_individual_rewards,
    )


def get_future_octant_rewards(context: FutureEpochContext):
    staking_proceeds_calculator = EstimatedStakingProceeds()
    octant_rewards_calculator = OctantRewardsCalculator()
    user_deposits_reader = UserDepositsReader()
    staking_proceeds = staking_proceeds_calculator.get_staking_proceeds(
        StakingProceedsPayload(context.epoch_details.duration_sec)
    )
    total_effective_deposit = user_deposits_reader.get_total_deposited()
    rewards = octant_rewards_calculator.calculate_rewards(
        context.epoch_settings.octant_rewards, staking_proceeds, total_effective_deposit
    )

    return OctantRewards(
        eth_proceeds=staking_proceeds,
        locked_ratio=rewards.locked_ratio,
        total_effective_deposit=total_effective_deposit,
        total_rewards=rewards.total_rewards,
        individual_rewards=rewards.all_individual_rewards,
    )
