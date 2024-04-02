from typing import Protocol

from app.modules.modules_factory.protocols import (
    OctantRewards,
    DonorsAddresses,
    GetUserAllocationsProtocol,
    UserPatronMode,
    UserRewards,
    UserEffectiveDeposits,
    TotalEffectiveDeposits,
    Leverage,
    UserBudgets,
    WithdrawalsService,
    SavedProjectRewardsService,
)
from app.modules.octant_rewards.service.finalized import FinalizedOctantRewards
from app.modules.project_rewards.service.saved import SavedProjectRewards
from app.modules.user.allocations.service.saved import SavedUserAllocations
from app.modules.user.budgets.service.saved import SavedUserBudgets
from app.modules.user.deposits.service.saved import SavedUserDeposits
from app.modules.user.patron_mode.service.events_based import EventsBasedUserPatronMode
from app.modules.user.rewards.service.saved import SavedUserRewards
from app.modules.withdrawals.service.finalized import FinalizedWithdrawals
from app.pydantic import Model


class FinalizedOctantRewardsProtocol(OctantRewards, Leverage, Protocol):
    pass


class FinalizedUserDeposits(UserEffectiveDeposits, TotalEffectiveDeposits, Protocol):
    pass


class FinalizedUserAllocationsProtocol(
    DonorsAddresses, GetUserAllocationsProtocol, Protocol
):
    pass


class FinalizedServices(Model):
    user_deposits_service: FinalizedUserDeposits
    octant_rewards_service: FinalizedOctantRewardsProtocol
    user_allocations_service: FinalizedUserAllocationsProtocol
    user_patron_mode_service: UserPatronMode
    user_budgets_service: UserBudgets
    user_rewards_service: UserRewards
    withdrawals_service: WithdrawalsService
    project_rewards_service: SavedProjectRewardsService

    @staticmethod
    def create() -> "FinalizedServices":
        events_based_patron_mode = EventsBasedUserPatronMode()
        saved_user_allocations = SavedUserAllocations()
        saved_user_budgets = SavedUserBudgets()
        user_rewards = SavedUserRewards(
            user_budgets=saved_user_budgets,
            patrons_mode=events_based_patron_mode,
            allocations=saved_user_allocations,
        )
        withdrawals_service = FinalizedWithdrawals(user_rewards=user_rewards)

        return FinalizedServices(
            user_deposits_service=SavedUserDeposits(),
            octant_rewards_service=FinalizedOctantRewards(),
            user_allocations_service=saved_user_allocations,
            user_patron_mode_service=events_based_patron_mode,
            user_budgets_service=saved_user_budgets,
            user_rewards_service=user_rewards,
            withdrawals_service=withdrawals_service,
            project_rewards_service=SavedProjectRewards(),
        )
