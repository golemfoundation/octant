from dataclasses import dataclass
from typing import Protocol

from app.modules.modules_factory.protocols import (
    OctantRewards,
    PendingSnapshots,
    UserEffectiveDeposits,
    AllUserEffectiveDeposits,
)
from app.modules.octant_rewards.service.calculated import CalculatedOctantRewards
from app.modules.snapshots.pending.service.pre_pending import PrePendingSnapshots
from app.modules.staking.proceeds.service.contract_balance import (
    ContractBalanceStakingProceeds,
)
from app.modules.user.deposits.service.calculated import CalculatedUserDeposits
from app.modules.user.events_generator.service.db_and_graph import (
    DbAndGraphEventsGenerator,
)


class PrePendingUserDeposits(UserEffectiveDeposits, AllUserEffectiveDeposits, Protocol):
    pass


@dataclass(frozen=True)
class PrePendingServices:
    user_deposits_service: PrePendingUserDeposits
    octant_rewards_service: OctantRewards
    pending_snapshots_service: PendingSnapshots

    @staticmethod
    def create() -> "PrePendingServices":
        user_deposits = CalculatedUserDeposits(
            events_generator=DbAndGraphEventsGenerator()
        )
        octant_rewards = CalculatedOctantRewards(
            staking_proceeds=ContractBalanceStakingProceeds(),
            effective_deposits=user_deposits,
        )

        return PrePendingServices(
            user_deposits_service=user_deposits,
            octant_rewards_service=octant_rewards,
            pending_snapshots_service=PrePendingSnapshots(
                effective_deposits=user_deposits, octant_rewards=octant_rewards
            ),
        )
