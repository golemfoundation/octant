from typing import runtime_checkable, Protocol

from app.context.manager import Context
from app.pydantic import Model
from app.modules.user.budgets import core
from app.modules.dto import PendingSnapshotDTO


@runtime_checkable
class SimulatePendingSnapshots(Protocol):
    def simulate_pending_epoch_snapshot(self, context: Context) -> PendingSnapshotDTO:
        ...


class UpcomingUserBudgets(Model):
    simulated_pending_snapshot_service: SimulatePendingSnapshots

    def get_budget(self, context: Context, user_address: str) -> int:
        simulated_snapshot = (
            self.simulated_pending_snapshot_service.simulate_pending_epoch_snapshot(
                context
            )
        )
        upcoming_budget = core.get_upcoming_budget(
            user_address, simulated_snapshot.user_budgets
        )

        return upcoming_budget
