from dataclasses import dataclass
from typing import Optional

from app.context.context import OctantRewards, Context
from app.infrastructure import database
from app.modules.snapshots.pending.core import calculate_user_budgets
from app.modules.user.deposits.service.service import UserDepositsService


def save_snapshot(epoch: int, rewards: OctantRewards):
    database.pending_epoch_snapshot.save_snapshot(
        epoch=epoch,
        eth_proceeds=rewards.eth_proceeds,
        total_rewards=rewards.total_rewards,
        all_individual_rewards=rewards.individual_rewards,
        locked_ratio=rewards.locked_ratio,
        total_ed=rewards.total_effective_deposit,
    )


@dataclass
class PrePendingSnapshots:
    user_deposits_service: UserDepositsService

    def create_pending_epoch_snapshot(self, context: Context) -> Optional[int]:
        pending_epoch = context.epoch_details.epoch_num
        rewards = context.octant_rewards
        (
            user_deposits,
            _,
        ) = self.user_deposits_service.get_all_effective_deposits(context)
        user_budgets = calculate_user_budgets(
            context.epoch_settings.user.budget, rewards, user_deposits
        )

        database.deposits.save_deposits(pending_epoch, user_deposits)
        database.budgets.save_budgets(pending_epoch, user_budgets)
        save_snapshot(pending_epoch, rewards)

        return pending_epoch
