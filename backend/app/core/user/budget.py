from decimal import Decimal

from app import database
from app.constants import GLM_TOTAL_SUPPLY_WEI
from app.core.epochs import details as epochs_details
from app.core.epochs.details import EpochDetails
from app.core.staking import estimate_epoch_eth_staking_proceeds
from app.database.models import PendingEpochSnapshot
from app.extensions import epochs
from app.utils.time import days_to_sec


def get_budget(user_address: str, epoch: int) -> int:
    snapshot = database.pending_epoch_snapshot.get_by_epoch_num(epoch)
    deposit = database.deposits.get_by_user_address_and_epoch(user_address, epoch)

    if snapshot is None or deposit is None or Decimal(deposit.effective_deposit) == 0:
        return 0

    return _calculate_budget(
        deposit.effective_deposit,
        snapshot.total_effective_deposit,
        snapshot.all_individual_rewards,
    )


def get_patrons_budget(snapshot: PendingEpochSnapshot) -> int:
    patrons = database.user.get_all_patrons()
    patrons_rewards = 0
    for patron in patrons:
        patrons_rewards += get_budget(patron.address, snapshot.epoch)

    return patrons_rewards


def estimate_budget(days: int, glm_amount: int) -> int:
    ...
    # TODO adjust to new arch
    # epoch_num = epochs.get_current_epoch()
    # epoch = epochs_details.get_epoch_details(epoch_num)
    # lock_duration = days_to_sec(days)
    # estimated_total_effective_deposit = get_estimated_total_effective_deposit(epoch_num)
    # total_locked_ratio = calculate_locked_ratio(
    #     estimated_total_effective_deposit, GLM_TOTAL_SUPPLY_WEI
    # )
    #
    # budget = 0
    #
    # budget += _estimate_current_epoch_budget(
    #     epoch_num,
    #     epoch,
    #     lock_duration,
    #     glm_amount,
    #     total_locked_ratio,
    #     estimated_total_effective_deposit,
    # )
    # lock_duration -= epoch.remaining_sec
    #
    # if lock_duration > 0:
    #     budget += _estimate_future_epochs_budget(
    #         epoch_num,
    #         lock_duration,
    #         glm_amount,
    #         total_locked_ratio,
    #         estimated_total_effective_deposit,
    #     )
    #
    # return budget


# def _estimate_current_epoch_budget(
#     epoch_num: int,
#     epoch: EpochDetails,
#     lock_duration: int,
#     glm_amount: int,
#     total_locked_ratio: Decimal,
#     total_effective_deposit: int,
# ):
#     eth_proceeds = estimate_epoch_eth_staking_proceeds(epoch.duration_sec)
#     current_epoch_rewards_strategy = EpochsRegistry.get_epoch_settings(
#         epoch_num
#     ).rewards_strategy
#     user_effective_deposit = estimate_effective_deposit(
#         epoch, glm_amount, lock_duration
#     )
#     all_individual_rewards = (
#         current_epoch_rewards_strategy.calculate_all_individual_rewards(
#             eth_proceeds, total_locked_ratio
#         )
#     )
#     return _calculate_budget(
#         user_effective_deposit, total_effective_deposit, all_individual_rewards
#     )
#
#
# def _estimate_future_epochs_budget(
#     current_epoch_num: int,
#     lock_duration: int,
#     glm_amount: int,
#     total_locked_ratio: Decimal,
#     total_effective_deposit: int,
# ):
#     budget = 0
#     epoch = epochs_details.get_future_epoch_details()
#     eth_proceeds = estimate_epoch_eth_staking_proceeds(epoch.duration_sec)
#     # TODO We assume that there is only one strategy for all upcoming epochs. Using a proper strategy for the future epochs will be handled in this task: https://linear.app/golemfoundation/issue/OCT-943/prepare-a-budget-calculator-for-different-rewards-strategies-in-the
#     future_epoch_rewards_strategy = EpochsRegistry.get_epoch_settings(
#         current_epoch_num + 1
#     ).rewards_strategy
#
#     # Calculate the budget from GLM kept through the whole epochs
#     full_epochs_num, remaining_lock_duration = divmod(lock_duration, epoch.duration_sec)
#     full_epoch_user_ed = estimate_effective_deposit(
#         epoch, glm_amount, epoch.duration_sec
#     )
#     future_epoch_all_individual_rewards = (
#         future_epoch_rewards_strategy.calculate_all_individual_rewards(
#             eth_proceeds, total_locked_ratio
#         )
#     )
#
#     budget += full_epochs_num * _calculate_budget(
#         full_epoch_user_ed, total_effective_deposit, future_epoch_all_individual_rewards
#     )
#
#     # Calculate the budget from remaining part of the future epochs
#     remaining_user_ed = estimate_effective_deposit(
#         epoch, glm_amount, remaining_lock_duration
#     )
#     budget += _calculate_budget(
#         remaining_user_ed, total_effective_deposit, future_epoch_all_individual_rewards
#     )
#
#     return budget
#
#
def _calculate_budget(
    user_effective_deposit: int,
    total_effective_deposit: int,
    all_individual_rewards: int,
):
    individual_share = Decimal(user_effective_deposit) / Decimal(
        total_effective_deposit
    )

    return int(Decimal(all_individual_rewards) * individual_share)
