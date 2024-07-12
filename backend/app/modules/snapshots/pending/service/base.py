from typing import Protocol, Tuple, List, runtime_checkable
from app.context.manager import Context
from app.modules.dto import OctantRewardsDTO, PendingSnapshotDTO
from app.pydantic import Model
from app.modules.snapshots.pending.core import calculate_user_budgets
from app.engine.user.effective_deposit import UserDeposit


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


class BasePrePendingSnapshots(Model):
    effective_deposits: EffectiveDeposits
    octant_rewards: OctantRewards

    def _calculate_pending_epoch_snapshot(self, context: Context) -> PendingSnapshotDTO:
        rewards = self.octant_rewards.get_octant_rewards(context)

        (
            user_deposits,
            _,
        ) = self.effective_deposits.get_all_effective_deposits(context)
        user_budgets = calculate_user_budgets(
            context.epoch_settings.user.budget, rewards, user_deposits
        )

        return PendingSnapshotDTO(
            rewards=rewards, user_deposits=user_deposits, user_budgets=user_budgets
        )
