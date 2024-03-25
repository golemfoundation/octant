from typing import Protocol

import app.modules.staking.proceeds.service.aggregated as aggregated
import app.modules.staking.proceeds.service.contract_balance as contract_balance
from app.modules.modules_factory.protocols import (
    OctantRewards,
    UserEffectiveDeposits,
    TotalEffectiveDeposits,
)
from app.modules.modules_factory.protocols import SimulatePendingSnapshots
from app.modules.octant_rewards.service.calculated import CalculatedOctantRewards
from app.modules.snapshots.pending.service.simulated import SimulatedPendingSnapshots
from app.modules.staking.proceeds.service.estimated import EstimatedStakingProceeds
from app.modules.user.deposits.service.calculated import CalculatedUserDeposits
from app.modules.user.events_generator.service.db_and_graph import (
    DbAndGraphEventsGenerator,
)
from app.pydantic import Model
from app.shared.blockchain_types import compare_blockchain_types, ChainTypes


class CurrentUserDeposits(UserEffectiveDeposits, TotalEffectiveDeposits, Protocol):
    pass


class CurrentServices(Model):
    user_deposits_service: CurrentUserDeposits
    octant_rewards_service: OctantRewards
    simulated_pending_snapshot_service: SimulatePendingSnapshots

    @staticmethod
    def _prepare_simulation_data(
        chain_id: int, user_deposits: CalculatedUserDeposits
    ) -> CalculatedOctantRewards:
        is_mainnet = compare_blockchain_types(chain_id, ChainTypes.MAINNET)

        octant_rewards = CalculatedOctantRewards(
            staking_proceeds=aggregated.AggregatedStakingProceeds()
            if is_mainnet
            else contract_balance.ContractBalanceStakingProceeds(),
            effective_deposits=user_deposits,
        )

        return octant_rewards

    @staticmethod
    def create(chain_id: int) -> "CurrentServices":
        user_deposits = CalculatedUserDeposits(
            events_generator=DbAndGraphEventsGenerator()
        )
        octant_rewards = CurrentServices._prepare_simulation_data(
            chain_id, user_deposits
        )
        simulated_pending_snapshot_service = SimulatedPendingSnapshots(
            effective_deposits=user_deposits, octant_rewards=octant_rewards
        )
        return CurrentServices(
            user_deposits_service=user_deposits,
            octant_rewards_service=CalculatedOctantRewards(
                staking_proceeds=EstimatedStakingProceeds(),
                effective_deposits=user_deposits,
            ),
            simulated_pending_snapshot_service=simulated_pending_snapshot_service,
        )
