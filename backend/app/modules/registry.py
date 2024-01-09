from collections import defaultdict
from dataclasses import dataclass
from typing import Dict, Optional

from app.context.epoch_state import EpochState
from app.exceptions import NotImplementedForGivenEpochState
from app.modules.octant_rewards.service.impl.calculated import (
    CalculatedOctantRewards,
)

from app.modules.octant_rewards.service.impl.finalized import FinalizedOctantRewards
from app.modules.octant_rewards.service.impl.pending import PendingOctantRewards
from app.modules.octant_rewards.service.service import OctantRewardsService
from app.modules.snapshots.pending.service.impl.pre_pending import (
    PrePendingSnapshots,
)
from app.modules.snapshots.pending.service.service import SnapshotsService
from app.modules.staking.proceeds.service.impl.contract_balance import (
    ContractBalanceStakingProceeds,
)
from app.modules.staking.proceeds.service.impl.estimated import (
    EstimatedStakingProceeds,
)
from app.modules.staking.proceeds.service.impl.saved import SavedStakingProceeds
from app.modules.staking.proceeds.service.service import StakingProceedsService
from app.modules.user.allocations.service.impl.saved import SavedUserAllocations
from app.modules.user.allocations.service.service import UserAllocationsService
from app.modules.user.budgets.service.impl.saved import SavedUserBudgets
from app.modules.user.budgets.service.service import UserBudgetsService
from app.modules.user.deposits.service.impl.calculated import CalculatedUserDeposits
from app.modules.user.deposits.service.impl.contract_balance import (
    ContractBalanceUserDeposits,
)
from app.modules.user.deposits.service.impl.saved import SavedUserDeposits
from app.modules.user.deposits.service.service import UserDepositsService
from app.modules.user.events_generator.service.impl.db_and_graph import (
    DbAndGraphEventsGenerator,
)
from app.modules.user.patron_mode.service.impl.events_based import (
    EventsBasedUserPatronMode,
)
from app.modules.user.patron_mode.service.service import UserPatronModeService
from app.modules.user.rewards.service.impl.saved import SavedUserRewards
from app.modules.user.rewards.service.service import UserRewardsService


@dataclass(frozen=True)
class ServiceRegistry:
    staking_proceeds_service: Optional[StakingProceedsService] = None
    user_deposits_service: Optional[UserDepositsService] = None
    user_budgets_service: Optional[UserBudgetsService] = None
    user_allocations_service: Optional[UserAllocationsService] = None
    user_patron_mode_service: Optional[UserPatronModeService] = None
    user_rewards_service: Optional[UserRewardsService] = None
    snapshots_service: Optional[SnapshotsService] = None
    octant_rewards_service: Optional[OctantRewardsService] = None

    def __getattribute__(self, attr):
        if not super(ServiceRegistry, self).__getattribute__(attr):
            raise NotImplementedForGivenEpochState(attr)
        return super(ServiceRegistry, self).__getattribute__(attr)


SERVICE_REGISTRY: Dict[EpochState, ServiceRegistry] = defaultdict(
    lambda: ServiceRegistry()
)


def get_services(epoch_state: EpochState) -> ServiceRegistry:
    return SERVICE_REGISTRY[epoch_state]


def register_services():
    (
        saved_staking_proceeds,
        contract_balance_staking_proceeds,
        estimated_staking_proceeds,
    ) = _get_staking_proceeds_services()

    (
        saved_user_deposits,
        calculated_user_deposits,
        contract_balance_user_deposits,
    ) = _get_user_deposit_services()
    saved_user_budgets = _get_user_budgets_services()
    saved_user_allocations = _get_user_allocations_services()
    events_based_patron_mode = _get_user_patron_mode_services()
    saved_user_rewards = _get_user_rewards_services(
        saved_user_budgets, events_based_patron_mode, saved_user_allocations
    )

    pre_pending_snapshots = _get_snapshots_services(calculated_user_deposits)

    (
        pending_octant_rewards,
        finalized_octant_rewards,
        pre_pending_calculated_octant_rewards,
        current_calculated_octant_rewards,
        future_calculated_octant_rewards,
    ) = _get_octant_rewards_services(
        estimated_staking_proceeds,
        contract_balance_user_deposits,
        calculated_user_deposits,
        contract_balance_staking_proceeds,
    )
    SERVICE_REGISTRY[EpochState.FUTURE] = ServiceRegistry(
        staking_proceeds_service=estimated_staking_proceeds,
        user_deposits_service=contract_balance_user_deposits,
        octant_rewards_service=future_calculated_octant_rewards,
    )
    SERVICE_REGISTRY[EpochState.CURRENT] = ServiceRegistry(
        staking_proceeds_service=estimated_staking_proceeds,
        user_deposits_service=calculated_user_deposits,
        octant_rewards_service=current_calculated_octant_rewards,
    )
    SERVICE_REGISTRY[EpochState.PRE_PENDING] = ServiceRegistry(
        staking_proceeds_service=contract_balance_staking_proceeds,
        user_deposits_service=calculated_user_deposits,
        octant_rewards_service=pre_pending_calculated_octant_rewards,
        snapshots_service=pre_pending_snapshots,
    )
    SERVICE_REGISTRY[EpochState.PENDING] = ServiceRegistry(
        staking_proceeds_service=saved_staking_proceeds,
        user_deposits_service=saved_user_deposits,
        octant_rewards_service=pending_octant_rewards,
        user_budgets_service=saved_user_budgets,
        user_allocations_service=saved_user_allocations,
        user_patron_mode_service=events_based_patron_mode,
        user_rewards_service=saved_user_rewards,
    )
    SERVICE_REGISTRY[EpochState.FINALIZING] = ServiceRegistry(
        staking_proceeds_service=saved_staking_proceeds,
        user_deposits_service=saved_user_deposits,
        octant_rewards_service=pending_octant_rewards,
        user_budgets_service=saved_user_budgets,
        user_allocations_service=saved_user_allocations,
        user_patron_mode_service=events_based_patron_mode,
        user_rewards_service=saved_user_rewards,
    )
    SERVICE_REGISTRY[EpochState.FINALIZED] = ServiceRegistry(
        staking_proceeds_service=saved_staking_proceeds,
        user_deposits_service=saved_user_deposits,
        octant_rewards_service=finalized_octant_rewards,
        user_budgets_service=saved_user_budgets,
        user_allocations_service=saved_user_allocations,
        user_patron_mode_service=events_based_patron_mode,
        user_rewards_service=saved_user_rewards,
    )


def _get_staking_proceeds_services():
    saved_staking_proceeds = SavedStakingProceeds()
    contract_balance_staking_proceeds = ContractBalanceStakingProceeds()
    estimated_staking_proceeds = EstimatedStakingProceeds()

    return (
        saved_staking_proceeds,
        contract_balance_staking_proceeds,
        estimated_staking_proceeds,
    )


def _get_user_deposit_services():
    subgraph_events_generator = DbAndGraphEventsGenerator()
    saved_user_deposits = SavedUserDeposits()
    calculated_user_deposits = CalculatedUserDeposits(
        events_generator=subgraph_events_generator
    )
    contract_balance_user_deposits = ContractBalanceUserDeposits()

    return saved_user_deposits, calculated_user_deposits, contract_balance_user_deposits


def _get_user_budgets_services():
    saved_user_budgets = SavedUserBudgets()
    return saved_user_budgets


def _get_user_patron_mode_services():
    events_based_patron_mode = EventsBasedUserPatronMode()
    return events_based_patron_mode


def _get_user_allocations_services():
    saved_user_allocations = SavedUserAllocations()
    return saved_user_allocations


def _get_user_rewards_services(
    saved_user_budgets: SavedUserBudgets,
    events_based_patron_mode: EventsBasedUserPatronMode,
    saved_user_allocations: SavedUserAllocations,
):
    saved_user_rewards = SavedUserRewards(
        budgets_service=saved_user_budgets,
        patrons_mode_service=events_based_patron_mode,
        allocations_service=saved_user_allocations,
    )
    return saved_user_rewards


def _get_snapshots_services(calculated_user_deposits: CalculatedUserDeposits):
    pre_pending_snapshots = PrePendingSnapshots(
        user_deposits_service=calculated_user_deposits
    )

    return pre_pending_snapshots


def _get_octant_rewards_services(
    estimated_staking_proceeds: EstimatedStakingProceeds,
    contract_balance_user_deposits: ContractBalanceUserDeposits,
    calculated_user_deposits: CalculatedUserDeposits,
    contract_balance_staking_proceeds: ContractBalanceStakingProceeds,
):
    pending_octant_rewards = PendingOctantRewards()
    finalized_octant_rewards = FinalizedOctantRewards()
    pre_pending_calculated_octant_rewards = CalculatedOctantRewards(
        contract_balance_staking_proceeds,
        calculated_user_deposits,
    )
    current_calculated_octant_rewards = CalculatedOctantRewards(
        estimated_staking_proceeds,
        calculated_user_deposits,
    )
    future_calculated_octant_rewards = CalculatedOctantRewards(
        estimated_staking_proceeds,
        contract_balance_user_deposits,
    )

    return (
        pending_octant_rewards,
        finalized_octant_rewards,
        pre_pending_calculated_octant_rewards,
        current_calculated_octant_rewards,
        future_calculated_octant_rewards,
    )
