from abc import abstractmethod
from dataclasses import dataclass
from typing import Optional

from app import database
from app.extensions import db
from app.v2.context.context import EpochContext, OctantRewards
from app.v2.modules.snapshots.pending.core import calculate_user_budgets
from app.v2.modules.snapshots.pending.service.impl.default import (
    DefaultSnapshotsService,
)


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
class PrePendingSnapshotsService(DefaultSnapshotsService):
    @abstractmethod
    def create_pending_epoch_snapshot(self, context: EpochContext) -> Optional[int]:
        pending_epoch = context.epoch_num
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

        db.session.commit()

        return pending_epoch
