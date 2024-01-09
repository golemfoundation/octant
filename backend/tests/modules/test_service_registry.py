import pytest

from app.context.epoch_state import EpochState
from app.exceptions import NotImplementedForGivenEpochState
from app.modules.octant_rewards.service.impl.calculated import (
    CalculatedOctantRewards,
)
from app.modules.octant_rewards.service.impl.finalized import FinalizedOctantRewards
from app.modules.octant_rewards.service.impl.pending import PendingOctantRewards
from app.modules.registry import register_services, get_services
from app.modules.snapshots.pending.service.impl.pre_pending import (
    PrePendingSnapshots,
)
from app.modules.staking.proceeds.service.impl.contract_balance import (
    ContractBalanceStakingProceeds,
)
from app.modules.staking.proceeds.service.impl.estimated import (
    EstimatedStakingProceeds,
)
from app.modules.staking.proceeds.service.impl.saved import SavedStakingProceeds
from app.modules.user.allocations.service.impl.saved import SavedUserAllocations
from app.modules.user.budgets.service.impl.saved import SavedUserBudgets
from app.modules.user.deposits.service.impl.calculated import CalculatedUserDeposits
from app.modules.user.deposits.service.impl.contract_balance import (
    ContractBalanceUserDeposits,
)
from app.modules.user.deposits.service.impl.saved import SavedUserDeposits
from app.modules.user.events_generator.service.impl.db_and_graph import (
    DbAndGraphEventsGenerator,
)
from app.modules.user.patron_mode.service.impl.events_based import (
    EventsBasedUserPatronMode,
)
from app.modules.user.rewards.service.impl.saved import SavedUserRewards


@pytest.mark.parametrize(
    "state, user_deposits_service, staking_proceeds_service, octant_rewards_service, snapshots_service, user_budgets_service, user_allocations_service, user_patron_mode_service, user_rewards_service",
    [
        (
            EpochState.FUTURE,
            ContractBalanceUserDeposits(),
            EstimatedStakingProceeds(),
            CalculatedOctantRewards(
                EstimatedStakingProceeds(), ContractBalanceUserDeposits()
            ),
            None,
            None,
            None,
            None,
            None,
        ),
        (
            EpochState.CURRENT,
            CalculatedUserDeposits(DbAndGraphEventsGenerator()),
            EstimatedStakingProceeds(),
            CalculatedOctantRewards(
                EstimatedStakingProceeds(),
                CalculatedUserDeposits(DbAndGraphEventsGenerator()),
            ),
            None,
            None,
            None,
            None,
            None,
        ),
        (
            EpochState.PRE_PENDING,
            CalculatedUserDeposits(DbAndGraphEventsGenerator()),
            ContractBalanceStakingProceeds(),
            CalculatedOctantRewards(
                ContractBalanceStakingProceeds(),
                CalculatedUserDeposits(DbAndGraphEventsGenerator()),
            ),
            PrePendingSnapshots(CalculatedUserDeposits(DbAndGraphEventsGenerator())),
            None,
            None,
            None,
            None,
        ),
        (
            EpochState.PENDING,
            SavedUserDeposits(),
            SavedStakingProceeds(),
            PendingOctantRewards(),
            None,
            SavedUserBudgets(),
            SavedUserAllocations(),
            EventsBasedUserPatronMode(),
            SavedUserRewards(
                SavedUserAllocations(),
                SavedUserBudgets(),
                EventsBasedUserPatronMode(),
            ),
        ),
        (
            EpochState.FINALIZING,
            SavedUserDeposits(),
            SavedStakingProceeds(),
            PendingOctantRewards(),
            None,
            SavedUserBudgets(),
            SavedUserAllocations(),
            EventsBasedUserPatronMode(),
            SavedUserRewards(
                SavedUserAllocations(),
                SavedUserBudgets(),
                EventsBasedUserPatronMode(),
            ),
        ),
        (
            EpochState.FINALIZED,
            SavedUserDeposits(),
            SavedStakingProceeds(),
            FinalizedOctantRewards(),
            None,
            SavedUserBudgets(),
            SavedUserAllocations(),
            EventsBasedUserPatronMode(),
            SavedUserRewards(
                SavedUserAllocations(),
                SavedUserBudgets(),
                EventsBasedUserPatronMode(),
            ),
        ),
    ],
)
def test_user_deposits_service_registry(
    state,
    user_deposits_service,
    staking_proceeds_service,
    octant_rewards_service,
    snapshots_service,
    user_budgets_service,
    user_allocations_service,
    user_patron_mode_service,
    user_rewards_service,
):
    register_services()
    registry = get_services(state)

    _check_value(registry, "user_deposits_service", user_deposits_service)
    _check_value(registry, "staking_proceeds_service", staking_proceeds_service)
    _check_value(registry, "octant_rewards_service", octant_rewards_service)
    _check_value(registry, "snapshots_service", snapshots_service)
    _check_value(registry, "user_budgets_service", user_budgets_service)
    _check_value(registry, "user_allocations_service", user_allocations_service)
    _check_value(registry, "user_patron_mode_service", user_patron_mode_service)
    _check_value(registry, "user_rewards_service", user_rewards_service)


def _check_value(registry, name, value):
    if value:
        assert getattr(registry, name) == value
    else:
        with pytest.raises(NotImplementedForGivenEpochState):
            getattr(registry, name)
