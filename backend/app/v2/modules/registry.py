from collections import defaultdict
from dataclasses import dataclass
from functools import partial
from typing import Dict, Optional

from app.v2.context.epoch_state import EpochState
from app.v2.modules.octant_rewards.service.impl.calculated import (
    CalculatedOctantRewards,
)
from app.v2.modules.octant_rewards.service.impl.saved import SavedOctantRewards
from app.v2.modules.octant_rewards.service.service import OctantRewardsService
from app.v2.modules.snapshots.pending.service.impl.pre_pending import (
    PrePendingSnapshotsService,
)
from app.v2.modules.snapshots.pending.service.service import SnapshotsService
from app.v2.modules.staking.proceeds.service.impl.contract_balance import (
    ContractBalanceStakingProceeds,
)
from app.v2.modules.staking.proceeds.service.impl.estimated import (
    EstimatedStakingProceeds,
)
from app.v2.modules.staking.proceeds.service.impl.saved import SavedStakingProceeds
from app.v2.modules.staking.proceeds.service.service import StakingProceedsService
from app.v2.modules.user.deposits.service.impl.calculated import CalculatedUserDeposits
from app.v2.modules.user.deposits.service.impl.contract_balance import (
    ContractBalanceUserDeposits,
)
from app.v2.modules.user.deposits.service.impl.saved import SavedUserDeposits
from app.v2.modules.user.deposits.service.service import UserDepositsService
from app.v2.modules.user.events_generator.service.impl.subgraph import (
    SubgraphEventsGenerator,
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
    subgraph_events_generator = SubgraphEventsGenerator()
    saved_user_deposits = SavedUserDeposits()
    contract_balance_user_deposits = ContractBalanceUserDeposits()
    saved_octant_rewards = SavedOctantRewards()
    calculated_user_deposits = CalculatedUserDeposits(
        events_generator=subgraph_events_generator
    )
    pre_pending_snapshots = PrePendingSnapshotsService(
        user_deposits_service=calculated_user_deposits
    )
    calculated_octant_rewards = partial(
        CalculatedOctantRewards,
        estimated_staking_proceeds,
        contract_balance_user_deposits,
    )

    SERVICE_REGISTRY[EpochState.FUTURE] = _build_registry(
        staking_proceeds=estimated_staking_proceeds,
        user_deposits=contract_balance_user_deposits,
        octant_rewards=calculated_octant_rewards(),
    )
    SERVICE_REGISTRY[EpochState.CURRENT] = _build_registry(
        staking_proceeds=estimated_staking_proceeds,
        user_deposits=calculated_user_deposits,
        octant_rewards=calculated_octant_rewards(
            estimated_staking_proceeds, calculated_user_deposits
        ),
    )
    SERVICE_REGISTRY[EpochState.PRE_PENDING] = _build_registry(
        staking_proceeds=contract_balance_staking_proceeds,
        user_deposits=calculated_user_deposits,
        octant_rewards=calculated_octant_rewards(
            contract_balance_staking_proceeds, calculated_user_deposits
        ),
        snapshots_service=pre_pending_snapshots,
    )
    SERVICE_REGISTRY[EpochState.PENDING] = _build_registry(
        staking_proceeds=saved_staking_proceeds,
        user_deposits=saved_user_deposits,
        octant_rewards=saved_octant_rewards,
    )
    SERVICE_REGISTRY[EpochState.FINALIZING] = _build_registry(
        staking_proceeds=saved_staking_proceeds,
        user_deposits=saved_user_deposits,
        octant_rewards=saved_octant_rewards,
    )
    SERVICE_REGISTRY[EpochState.FINALIZED] = _build_registry(
        staking_proceeds=saved_staking_proceeds,
        user_deposits=saved_user_deposits,
        octant_rewards=saved_octant_rewards,
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
