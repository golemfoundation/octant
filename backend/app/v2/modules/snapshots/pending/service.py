from dataclasses import dataclass
from typing import Optional

from flask import current_app as app

from app.context.context import PendingEpochContext
from app.extensions import db
from app.v2.modules.octant_rewards.service import OctantRewardsCalculator
from app.v2.modules.snapshots.pending.db import save_snapshot
from app.v2.modules.user.budgets.service import (
    UserBudgetsCalculator,
    UserBudgetsCreator,
)
from app.v2.modules.user.deposits.service import (
    UserDepositsCalculator,
    UserDepositsCreator,
)


@dataclass
class PendingSnapshotsCreator:
    user_deposits_calculator: UserDepositsCalculator
    user_deposits_creator: UserDepositsCreator
    user_budgets_calculator: UserBudgetsCalculator
    user_budgets_creator: UserBudgetsCreator
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
        ) = self.user_deposits_calculator.calculate_effective_deposits(context)

        rewards_dto = self.octant_rewards_calculator.calculate_rewards(
            context, total_effective_deposit
        )
        user_budgets = self.user_budgets_calculator.calculate_budgets(
            context,
            user_deposits,
            total_effective_deposit,
            rewards_dto.all_individual_rewards,
        )

        self.user_deposits_creator.save_deposits(pending_epoch, user_deposits)
        self.user_budgets_creator.save_budgets(pending_epoch, user_budgets)
        save_snapshot(pending_epoch, rewards_dto, total_effective_deposit)

        db.session.commit()

        return pending_epoch
