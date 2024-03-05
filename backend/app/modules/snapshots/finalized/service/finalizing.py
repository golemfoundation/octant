from app.context.manager import Context
from app.infrastructure import database
from app.modules.dto import FinalizedSnapshotDTO
from app.modules.snapshots.finalized.service.base import BaseFinalizedSnapshots
from app.extensions import db


def save_snapshot(epoch: int, dto: FinalizedSnapshotDTO):
    database.rewards.add_all(epoch, dto.user_rewards + dto.projects_rewards)
    database.finalized_epoch_snapshot.save_snapshot(
        epoch=epoch,
        patrons_rewards=dto.patrons_rewards,
        matched_rewards=dto.matched_rewards,
        leftover=dto.leftover,
        withdrawals_merkle_root=dto.merkle_root,
        total_withdrawals=dto.total_withdrawals,
    )


class FinalizingSnapshots(BaseFinalizedSnapshots):
    def create_finalized_epoch_snapshot(self, context: Context) -> int:
        epoch_num = context.epoch_details.epoch_num
        finalized_snapshot_dto = self._calculate_finalized_epoch_snapshot(context)
        save_snapshot(epoch_num, finalized_snapshot_dto)
        db.session.commit()

        return epoch_num
