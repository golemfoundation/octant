from typing import Protocol, Tuple, List, runtime_checkable

from app.context.manager import Context
from app.engine.user.effective_deposit import UserDeposit
from app.extensions import db
from app.infrastructure import database
from app.modules.dto import OctantRewardsDTO
from app.modules.snapshots.pending.core import calculate_user_budgets
from app.pydantic import Model


@runtime_checkable
class EffectiveDeposits(Protocol):
    def get_all_effective_deposits(
        self, context: Context
    ) -> Tuple[List[UserDeposit], int]:
        ...


@runtime_checkable
class OctantRewards(Protocol):
    def get_octant_rewards(self, context: Context) -> OctantRewardsDTO:
        ...


def save_snapshot(epoch: int, rewards: OctantRewardsDTO):
    database.pending_epoch_snapshot.save_snapshot(
        epoch=epoch,
        eth_proceeds=rewards.staking_proceeds,
        total_rewards=rewards.total_rewards,
        all_individual_rewards=rewards.individual_rewards,
        locked_ratio=rewards.locked_ratio,
        total_ed=rewards.total_effective_deposit,
        operational_cost=rewards.operational_cost,
    )


class PrePendingSnapshots(Model):
    effective_deposits: EffectiveDeposits
    octant_rewards: OctantRewards

    def create_pending_epoch_snapshot(self, context: Context) -> int:
        pending_epoch = context.epoch_details.epoch_num
        rewards = self.octant_rewards.get_octant_rewards(context)
        (
            user_deposits,
            _,
        ) = self.effective_deposits.get_all_effective_deposits(context)
        user_budgets = calculate_user_budgets(
            context.epoch_settings.user.budget, rewards, user_deposits
        )

        database.deposits.save_deposits(pending_epoch, user_deposits)
        database.budgets.save_budgets(pending_epoch, user_budgets)
        save_snapshot(pending_epoch, rewards)
        db.session.commit()

        return pending_epoch
