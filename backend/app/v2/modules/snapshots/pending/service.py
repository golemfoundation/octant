from dataclasses import dataclass
from typing import Optional

from flask import current_app as app

from app import database
from app.database.pending_epoch_snapshot import save_snapshot
from app.extensions import db
from app.v2.context.context import PendingEpochContext
from app.v2.modules.octant_rewards.service import (
    OctantRewardsCalculator,
    OctantRewardsDTO,
)
from app.v2.modules.user.budgets.service import (
    UserBudgetsCalculator,
)
from app.v2.modules.user.deposits.service import (
    UserDepositsCalculator,
)


@dataclass
class PendingSnapshotsCreator:
    user_deposits_calculator: UserDepositsCalculator
    user_budgets_calculator: UserBudgetsCalculator
    octant_rewards_calculator: OctantRewardsCalculator

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
        ) = self.user_deposits_calculator.calculate_all_effective_deposits(context)

        rewards_dto = self.octant_rewards_calculator.calculate_rewards(
            context, total_effective_deposit
        )
        user_budgets = self.user_budgets_calculator.calculate_budgets(
            context,
            user_deposits,
            total_effective_deposit,
            rewards_dto.all_individual_rewards,
        )

        database.deposits.save_deposits(pending_epoch, user_deposits)
        database.budgets.save_budgets(pending_epoch, user_budgets)
        self._save_snapshot(pending_epoch, rewards_dto, total_effective_deposit)

        db.session.commit()

        return pending_epoch

    def _save_snapshot(
        self, epoch: int, rewards: OctantRewardsDTO, total_effective_deposit: int
    ):
        save_snapshot(
            epoch=epoch,
            eth_proceeds=rewards.eth_proceeds,
            total_rewards=rewards.total_rewards,
            all_individual_rewards=rewards.all_individual_rewards,
            locked_ratio=rewards.locked_ratio,
            total_ed=total_effective_deposit,
        )
