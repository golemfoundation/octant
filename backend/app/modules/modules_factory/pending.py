from typing import Protocol

from app.modules.modules_factory.protocols import (
    OctantRewards,
    DonorsAddresses,
    UserPatronMode,
    UserRewards,
    UserEffectiveDeposits,
    TotalEffectiveDeposits,
    Leverage,
    SimulateAllocation,
    FinalizedSnapshots,
)
from app.modules.octant_rewards.service.pending import PendingOctantRewards
from app.modules.snapshots.finalized.service.simulated import (
    SimulatedFinalizedSnapshots,
)
from app.modules.user.allocations.service.pending import PendingUserAllocations
from app.modules.user.budgets.service.saved import SavedUserBudgets
from app.modules.user.deposits.service.saved import SavedUserDeposits
from app.modules.user.patron_mode.service.events_based import EventsBasedUserPatronMode
from app.modules.user.rewards.service.calculated import CalculatedUserRewards
from app.pydantic import Model


class PendingOctantRewardsService(OctantRewards, Leverage, Protocol):
    pass


class PendingUserDeposits(UserEffectiveDeposits, TotalEffectiveDeposits, Protocol):
    pass


class PendingUserAllocationsProtocol(DonorsAddresses, SimulateAllocation, Protocol):
    pass


class PendingServices(Model):
    user_deposits_service: PendingUserDeposits
    octant_rewards_service: PendingOctantRewardsService
    user_allocations_service: PendingUserAllocationsProtocol
    user_patron_mode_service: UserPatronMode
    user_rewards_service: UserRewards
    finalized_snapshots_service: FinalizedSnapshots

    @staticmethod
    def create() -> "PendingServices":
        events_based_patron_mode = EventsBasedUserPatronMode()
        octant_rewards = PendingOctantRewards(patrons_mode=events_based_patron_mode)
        saved_user_allocations = PendingUserAllocations(octant_rewards=octant_rewards)
        user_rewards = CalculatedUserRewards(
            user_budgets=SavedUserBudgets(),
            patrons_mode=events_based_patron_mode,
            allocations=saved_user_allocations,
        )
        finalized_snapshots_service = SimulatedFinalizedSnapshots(
            octant_rewards=octant_rewards,
            user_rewards=user_rewards,
            patrons_mode=events_based_patron_mode,
        )

        return PendingServices(
            user_deposits_service=SavedUserDeposits(),
            octant_rewards_service=octant_rewards,
            user_allocations_service=saved_user_allocations,
            user_patron_mode_service=events_based_patron_mode,
            finalized_snapshots_service=finalized_snapshots_service,
            user_rewards_service=user_rewards,
        )
