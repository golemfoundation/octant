from dataclasses import dataclass
from typing import Optional

from flask import current_app as app

from app.context.context import PendingEpochContext
from app.extensions import db
from app.v2.modules.octant_rewards.service.octant_rewards import OctantRewardsService
from app.v2.modules.snapshots.database import save_snapshot
from app.v2.modules.user.database import save_deposits
from app.v2.modules.user.service.deposits import UserDepositsService


@dataclass
class PendingSnapshotsService:
    user_deposits_service: UserDepositsService
    octant_rewards_service: OctantRewardsService

    def snapshot_pending_epoch(
        self, pending_epoch: int, context: PendingEpochContext
    ) -> Optional[int]:
        app.logger.debug(f"Trying to snapshot pending epoch {pending_epoch} ")
        if context.pending_snapshot is not None:
            app.logger.debug("Pending snapshots are up to date")
            return None

        (
            user_deposits,
            total_effective_deposit,
        ) = self.user_deposits_service.get_effective_deposits(context)
        rewards_dto = self.octant_rewards_service.get_rewards(
            context, total_effective_deposit
        )

        save_deposits(pending_epoch, user_deposits)
        save_snapshot(pending_epoch, rewards_dto, total_effective_deposit)

        db.session.commit()

        return pending_epoch
