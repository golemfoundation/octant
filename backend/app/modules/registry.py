from collections import defaultdict
from dataclasses import dataclass
from typing import Dict, Optional

from app.context.epoch_state import EpochState
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
from app.modules.user.deposits.service.impl.calculated import CalculatedUserDeposits
from app.modules.user.deposits.service.impl.contract_balance import (
    ContractBalanceUserDeposits,
)
from app.modules.user.deposits.service.impl.saved import SavedUserDeposits
from app.modules.user.deposits.service.service import UserDepositsService
from app.modules.user.events_generator.service.impl.db_and_graph import (
    DbAndGraphEventsGenerator,
)


@dataclass(frozen=True)
class ServiceRegistry:
    staking_proceeds_service: Optional[StakingProceedsService] = None
    user_deposits_service: Optional[UserDepositsService] = None
    snapshots_service: Optional[SnapshotsService] = None
    octant_rewards_service: Optional[OctantRewardsService] = None


SERVICE_REGISTRY: Dict[EpochState, ServiceRegistry] = defaultdict(
    lambda: ServiceRegistry()
)


def get_services(epoch_state: EpochState) -> ServiceRegistry:
    return SERVICE_REGISTRY[epoch_state]


def register_services():
    saved_staking_proceeds = SavedStakingProceeds()
    contract_balance_staking_proceeds = ContractBalanceStakingProceeds()
    estimated_staking_proceeds = EstimatedStakingProceeds()
    subgraph_events_generator = DbAndGraphEventsGenerator()
    saved_user_deposits = SavedUserDeposits()
    contract_balance_user_deposits = ContractBalanceUserDeposits()
    pending_octant_rewards = PendingOctantRewards()
    finalized_octant_rewards = FinalizedOctantRewards()
    calculated_user_deposits = CalculatedUserDeposits(
        events_generator=subgraph_events_generator
    )
    pre_pending_snapshots = PrePendingSnapshots(
        user_deposits_service=calculated_user_deposits
    )

    SERVICE_REGISTRY[EpochState.FUTURE] = _build_registry(
        staking_proceeds=estimated_staking_proceeds,
        user_deposits=contract_balance_user_deposits,
        octant_rewards=CalculatedOctantRewards(
            estimated_staking_proceeds,
            contract_balance_user_deposits,
        ),
    )
    SERVICE_REGISTRY[EpochState.CURRENT] = _build_registry(
        staking_proceeds=estimated_staking_proceeds,
        user_deposits=calculated_user_deposits,
        octant_rewards=CalculatedOctantRewards(
            estimated_staking_proceeds,
            calculated_user_deposits,
        ),
    )
    SERVICE_REGISTRY[EpochState.PRE_PENDING] = _build_registry(
        staking_proceeds=contract_balance_staking_proceeds,
        user_deposits=calculated_user_deposits,
        octant_rewards=CalculatedOctantRewards(
            contract_balance_staking_proceeds,
            calculated_user_deposits,
        ),
        snapshots_service=pre_pending_snapshots,
    )
    SERVICE_REGISTRY[EpochState.PENDING] = _build_registry(
        staking_proceeds=saved_staking_proceeds,
        user_deposits=saved_user_deposits,
        octant_rewards=pending_octant_rewards,
    )
    SERVICE_REGISTRY[EpochState.FINALIZING] = _build_registry(
        staking_proceeds=saved_staking_proceeds,
        user_deposits=saved_user_deposits,
        octant_rewards=pending_octant_rewards,
    )
    SERVICE_REGISTRY[EpochState.FINALIZED] = _build_registry(
        staking_proceeds=saved_staking_proceeds,
        user_deposits=saved_user_deposits,
        octant_rewards=finalized_octant_rewards,
    )


def _build_registry(
    staking_proceeds: StakingProceedsService,
    user_deposits: UserDepositsService,
    octant_rewards: OctantRewardsService,
    snapshots_service: Optional[SnapshotsService] = None,
):
    return ServiceRegistry(
        staking_proceeds_service=staking_proceeds,
        user_deposits_service=user_deposits,
        snapshots_service=snapshots_service,
        octant_rewards_service=octant_rewards,
    )
