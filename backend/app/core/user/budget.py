from decimal import Decimal

from app import database
from app.core.deposits.deposits import estimate_locked_ratio
from app.core.epochs import details as epochs_details
from app.core.epochs.details import EpochDetails
from app.core.epochs.epochs_registry import EpochsRegistry
from app.core.rewards.rewards import estimate_epoch_eth_staking_proceeds
from app.extensions import epochs
from app.utils.time import days_to_sec


def get_budget(user_address: str, epoch: int) -> int:
    snapshot = database.pending_epoch_snapshot.get_by_epoch_num(epoch)
    deposit = database.deposits.get_by_user_address_and_epoch(user_address, epoch)

    if snapshot is None or deposit is None or Decimal(deposit.effective_deposit) == 0:
        return 0

    individual_share = Decimal(deposit.effective_deposit) / Decimal(
        snapshot.total_effective_deposit
    )

    return int(Decimal(snapshot.all_individual_rewards) * individual_share)


def estimate_budget(days: int, glm_amount: int) -> int:
    epoch_num = epochs.get_current_epoch()
    epoch = epochs_details.get_epoch_details(epoch_num)
    lock_duration = days_to_sec(days)
    budget = 0

    budget += _estimate_current_epoch_budget(
        epoch_num, epoch, lock_duration, glm_amount
    )
    lock_duration -= epoch.remaining_sec

    if lock_duration > 0:
        budget += _estimate_future_epochs_budget(epoch_num, lock_duration, glm_amount)

    return budget


def _estimate_current_epoch_budget(
    epoch_num: int, epoch: EpochDetails, lock_duration: int, glm_amount: int
):
    eth_proceeds = estimate_epoch_eth_staking_proceeds(epoch.duration_days)
    locked_ratio = estimate_locked_ratio(epoch, glm_amount, lock_duration)
    current_epoch_rewards_strategy = EpochsRegistry.get_epoch_settings(
        epoch_num
    ).rewardsStrategy
    return current_epoch_rewards_strategy.calculate_all_individual_rewards(
        eth_proceeds, locked_ratio
    )


def _estimate_future_epochs_budget(
    current_epoch_num: int, lock_duration: int, glm_amount: int
):
    budget = 0
    epoch = epochs_details.get_future_epoch_details()
    eth_proceeds = estimate_epoch_eth_staking_proceeds(epoch.duration_days)
    # We assume that there is only one strategy for all upcoming epochs
    future_epoch_rewards_strategy = EpochsRegistry.get_epoch_settings(
        current_epoch_num + 1
    ).rewardsStrategy

    # Calculate the budget from GLM kept through the whole epochs
    full_epochs_num, remaining_lock_duration = divmod(lock_duration, epoch.duration_sec)
    full_epoch_locked_ratio = estimate_locked_ratio(
        epoch, glm_amount, epoch.duration_sec
    )
    budget += (
        full_epochs_num
        * future_epoch_rewards_strategy.calculate_all_individual_rewards(
            eth_proceeds, full_epoch_locked_ratio
        )
    )

    # Calculate the budget from remaining part of the future epochs
    remaining_lock_ratio = estimate_locked_ratio(
        epoch, glm_amount, remaining_lock_duration
    )
    budget += future_epoch_rewards_strategy.calculate_all_individual_rewards(
        eth_proceeds, remaining_lock_ratio
    )

    return budget
