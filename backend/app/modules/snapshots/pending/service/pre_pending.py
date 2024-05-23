from app.context.manager import Context
from app.extensions import db
from app.infrastructure import database
from app.modules.dto import OctantRewardsDTO, PendingSnapshotDTO
from app.modules.snapshots.pending.service.base import BasePrePendingSnapshots


def save_snapshot(epoch: int, rewards: OctantRewardsDTO):
    database.pending_epoch_snapshot.save_snapshot(
        epoch=epoch,
        eth_proceeds=rewards.staking_proceeds,
        total_rewards=rewards.total_rewards,
        vanilla_individual_rewards=rewards.vanilla_individual_rewards,
        locked_ratio=rewards.locked_ratio,
        total_ed=rewards.total_effective_deposit,
        operational_cost=rewards.operational_cost,
        community_fund=rewards.community_fund,
        ppf=rewards.ppf,
    )


class PrePendingSnapshots(BasePrePendingSnapshots):
    def create_pending_epoch_snapshot(self, context: Context) -> int:
        pending_epoch = context.epoch_details.epoch_num

        pending_snapshot_dto = self._calculate_pending_epoch_snapshot(context)

        self._save_snapshot(pending_epoch, pending_snapshot_dto)

        return pending_epoch

    def _save_snapshot(self, epoch: int, pending_snapshot_dto: PendingSnapshotDTO):
        user_deposits = pending_snapshot_dto.user_deposits
        user_budgets = pending_snapshot_dto.user_budgets
        rewards = pending_snapshot_dto.rewards

        database.deposits.save_deposits(epoch, user_deposits)
        database.budgets.save_budgets(epoch, user_budgets)
        save_snapshot(epoch, rewards)
        db.session.commit()
