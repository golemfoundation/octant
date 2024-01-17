from app.context.epoch_state import EpochState
from app.modules.octant_rewards.service.calculated import (
    CalculatedOctantRewards,
)
from app.modules.octant_rewards.service.finalized import FinalizedOctantRewards
from app.modules.octant_rewards.service.pending import PendingOctantRewards
from app.modules.registry import register_services, get_services
from app.modules.snapshots.pending.service.pre_pending import (
    PrePendingSnapshots,
)
from app.modules.staking.proceeds.service.contract_balance import (
    ContractBalanceStakingProceeds,
)
from app.modules.staking.proceeds.service.estimated import (
    EstimatedStakingProceeds,
)
from app.modules.user.allocations.service.pending import PendingUserAllocations
from app.modules.user.allocations.service.saved import SavedUserAllocations
from app.modules.user.budgets.service.saved import SavedUserBudgets
from app.modules.user.deposits.service.calculated import CalculatedUserDeposits
from app.modules.user.deposits.service.contract_balance import (
    ContractBalanceUserDeposits,
)
from app.modules.user.deposits.service.saved import SavedUserDeposits
from app.modules.user.events_generator.service.db_and_graph import (
    DbAndGraphEventsGenerator,
)
from app.modules.user.patron_mode.service.events_based import (
    EventsBasedUserPatronMode,
)
from app.modules.user.rewards.service.saved import SavedUserRewards


def test_future_services_factory():
    register_services()
    result = get_services(EpochState.FUTURE)

    assert result.octant_rewards_service == CalculatedOctantRewards(
        staking_proceeds=EstimatedStakingProceeds(),
        effective_deposits=ContractBalanceUserDeposits(),
    )


def test_current_services_factory():
    register_services()
    result = get_services(EpochState.CURRENT)

    user_deposits = CalculatedUserDeposits(events_generator=DbAndGraphEventsGenerator())
    assert result.user_deposits_service == user_deposits
    assert result.octant_rewards_service == CalculatedOctantRewards(
        staking_proceeds=EstimatedStakingProceeds(),
        effective_deposits=user_deposits,
    )


def test_pre_pending_services_factory():
    register_services()
    result = get_services(EpochState.PRE_PENDING)

    user_deposits = CalculatedUserDeposits(events_generator=DbAndGraphEventsGenerator())
    octant_rewards = CalculatedOctantRewards(
        staking_proceeds=ContractBalanceStakingProceeds(),
        effective_deposits=user_deposits,
    )
    assert result.user_deposits_service == user_deposits
    assert result.octant_rewards_service == octant_rewards
    assert result.snapshots_service == PrePendingSnapshots(
        effective_deposits=user_deposits, octant_rewards=octant_rewards
    )


def test_pending_services_factory():
    register_services()
    result = get_services(EpochState.PENDING)

    events_based_patron_mode = EventsBasedUserPatronMode()
    octant_rewards = PendingOctantRewards(patrons_mode=events_based_patron_mode)
    user_allocations = PendingUserAllocations(octant_rewards=octant_rewards)
    assert result.user_deposits_service == SavedUserDeposits()
    assert result.octant_rewards_service == PendingOctantRewards(
        patrons_mode=events_based_patron_mode
    )
    assert result.user_allocations_service == user_allocations
    assert result.user_patron_mode_service == events_based_patron_mode
    assert result.user_rewards_service == SavedUserRewards(
        user_budgets=SavedUserBudgets(),
        patrons_mode=events_based_patron_mode,
        allocations=user_allocations,
    )


def test_finalizing_services_factory():
    register_services()
    result = get_services(EpochState.FINALIZING)

    events_based_patron_mode = EventsBasedUserPatronMode()
    saved_user_allocations = SavedUserAllocations()
    assert result.user_deposits_service == SavedUserDeposits()
    assert result.octant_rewards_service == PendingOctantRewards(
        patrons_mode=events_based_patron_mode
    )
    assert result.user_allocations_service == saved_user_allocations
    assert result.user_patron_mode_service == events_based_patron_mode
    assert result.user_rewards_service == SavedUserRewards(
        user_budgets=SavedUserBudgets(),
        patrons_mode=events_based_patron_mode,
        allocations=saved_user_allocations,
    )


def test_finalized_services_factory():
    register_services()
    result = get_services(EpochState.FINALIZED)

    events_based_patron_mode = EventsBasedUserPatronMode()
    saved_user_allocations = SavedUserAllocations()
    assert result.user_deposits_service == SavedUserDeposits()
    assert result.octant_rewards_service == FinalizedOctantRewards()
    assert result.user_allocations_service == saved_user_allocations
    assert result.user_patron_mode_service == events_based_patron_mode
    assert result.user_rewards_service == SavedUserRewards(
        user_budgets=SavedUserBudgets(),
        patrons_mode=events_based_patron_mode,
        allocations=saved_user_allocations,
    )
