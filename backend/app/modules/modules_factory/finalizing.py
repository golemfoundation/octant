from typing import Protocol

from app.modules.modules_factory.protocols import (
    OctantRewards,
    DonorsAddresses,
    UserPatronMode,
    UserRewards,
    UserEffectiveDeposits,
    TotalEffectiveDeposits,
    Leverage,
    UserBudgets,
    CreateFinalizedSnapshots,
    WithdrawalsService,
    SavedProjectRewardsService,
    ProjectsMetadataService,
)
from app.modules.octant_rewards.service.pending import PendingOctantRewards
from app.modules.projects.rewards.service.saved import SavedProjectRewards
from app.modules.snapshots.finalized.service.finalizing import FinalizingSnapshots
from app.modules.user.allocations.service.saved import SavedUserAllocations
from app.modules.user.budgets.service.saved import SavedUserBudgets
from app.modules.user.deposits.service.saved import SavedUserDeposits
from app.modules.user.patron_mode.service.events_based import EventsBasedUserPatronMode
from app.modules.user.rewards.service.calculated import CalculatedUserRewards
from app.modules.withdrawals.service.pending import PendingWithdrawals
from app.modules.projects.metadata.service.projects_metadata import (
    StaticProjectsMetadataService,
)
from app.pydantic import Model


class FinalizingOctantRewards(OctantRewards, Leverage, Protocol):
    pass


class FinalizingUserDeposits(UserEffectiveDeposits, TotalEffectiveDeposits, Protocol):
    pass


class FinalizingServices(Model):
    user_deposits_service: FinalizingUserDeposits
    octant_rewards_service: FinalizingOctantRewards
    user_allocations_service: DonorsAddresses
    user_patron_mode_service: UserPatronMode
    user_budgets_service: UserBudgets
    user_rewards_service: UserRewards
    finalized_snapshots_service: CreateFinalizedSnapshots
    withdrawals_service: WithdrawalsService
    project_rewards_service: SavedProjectRewardsService
    projects_metadata_service: ProjectsMetadataService

    @staticmethod
    def create() -> "FinalizingServices":
        events_based_patron_mode = EventsBasedUserPatronMode()
        saved_user_allocations = SavedUserAllocations()
        saved_user_budgets = SavedUserBudgets()
        octant_rewards = PendingOctantRewards(patrons_mode=events_based_patron_mode)
        user_rewards = CalculatedUserRewards(
            user_budgets=saved_user_budgets,
            patrons_mode=events_based_patron_mode,
            allocations=saved_user_allocations,
        )
        finalized_snapshots_service = FinalizingSnapshots(
            octant_rewards=octant_rewards,
            user_rewards=user_rewards,
            patrons_mode=events_based_patron_mode,
        )
        withdrawals_service = PendingWithdrawals(user_rewards=user_rewards)

        return FinalizingServices(
            user_deposits_service=SavedUserDeposits(),
            octant_rewards_service=octant_rewards,
            user_allocations_service=saved_user_allocations,
            user_patron_mode_service=events_based_patron_mode,
            user_budgets_service=saved_user_budgets,
            user_rewards_service=user_rewards,
            finalized_snapshots_service=finalized_snapshots_service,
            withdrawals_service=withdrawals_service,
            project_rewards_service=SavedProjectRewards(),
            projects_metadata_service=StaticProjectsMetadataService(),
        )
