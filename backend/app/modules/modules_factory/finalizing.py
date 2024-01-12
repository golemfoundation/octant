from dataclasses import dataclass
from typing import Protocol

from app.modules.modules_factory.protocols import (
    OctantRewards,
    UserAllocations,
    UserPatronMode,
    UserRewards,
    UserEffectiveDeposits,
    TotalEffectiveDeposits,
    Leverage,
)
from app.modules.octant_rewards.service.pending import PendingOctantRewards
from app.modules.user.allocations.service.saved import SavedUserAllocations
from app.modules.user.budgets.service.saved import SavedUserBudgets
from app.modules.user.deposits.service.saved import SavedUserDeposits
from app.modules.user.patron_mode.service.events_based import EventsBasedUserPatronMode
from app.modules.user.rewards.service.saved import SavedUserRewards


class FinalizingOctantRewards(OctantRewards, Leverage, Protocol):
    pass


class FinalizingUserDeposits(UserEffectiveDeposits, TotalEffectiveDeposits, Protocol):
    pass


@dataclass(frozen=True)
class FinalizingServices:
    user_deposits_service: FinalizingUserDeposits
    octant_rewards_service: FinalizingOctantRewards
    user_allocations_service: UserAllocations
    user_patron_mode_service: UserPatronMode
    user_rewards_service: UserRewards

    @staticmethod
    def create() -> "FinalizingServices":
        events_based_patron_mode = EventsBasedUserPatronMode()
        saved_user_allocations = SavedUserAllocations()

        return FinalizingServices(
            user_deposits_service=SavedUserDeposits(),
            octant_rewards_service=PendingOctantRewards(
                patrons_mode=events_based_patron_mode
            ),
            user_allocations_service=saved_user_allocations,
            user_patron_mode_service=events_based_patron_mode,
            user_rewards_service=SavedUserRewards(
                user_budgets=SavedUserBudgets(),
                patrons_mode=events_based_patron_mode,
                allocations=saved_user_allocations,
            ),
        )
