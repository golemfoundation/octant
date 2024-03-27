from typing import Protocol

import app.modules.staking.proceeds.service.aggregated as aggregated
import app.modules.staking.proceeds.service.contract_balance as contract_balance
from app.modules.history.service.full import FullHistory
from app.modules.modules_factory.protocols import (
    OctantRewards,
    UserEffectiveDeposits,
    TotalEffectiveDeposits,
    HistoryService,
)
from app.modules.modules_factory.protocols import SimulatePendingSnapshots
from app.modules.octant_rewards.service.calculated import CalculatedOctantRewards
from app.modules.snapshots.pending.service.simulated import SimulatedPendingSnapshots
from app.modules.staking.proceeds.service.estimated import EstimatedStakingProceeds
from app.modules.user.allocations.service.saved import SavedUserAllocations
from app.modules.user.deposits.service.calculated import CalculatedUserDeposits
from app.modules.user.events_generator.service.db_and_graph import (
    DbAndGraphEventsGenerator,
)
from app.modules.user.patron_mode.service.events_based import EventsBasedUserPatronMode
from app.modules.withdrawals.service.finalized import FinalizedWithdrawals
from app.pydantic import Model
from app.shared.blockchain_types import compare_blockchain_types, ChainTypes


class CurrentUserDeposits(UserEffectiveDeposits, TotalEffectiveDeposits, Protocol):
    pass


class CurrentServices(Model):
    user_allocations_service: SavedUserAllocations
    user_deposits_service: CurrentUserDeposits
    octant_rewards_service: OctantRewards
    history_service: HistoryService
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
        user_allocations = SavedUserAllocations()
        user_withdrawals = FinalizedWithdrawals()
        patron_donations = EventsBasedUserPatronMode()
        history = FullHistory(
            user_deposits=user_deposits,
            user_allocations=user_allocations,
            user_withdrawals=user_withdrawals,
            patron_donations=patron_donations,
        )
        return CurrentServices(
            user_allocations_service=user_allocations,
            user_deposits_service=user_deposits,
            octant_rewards_service=CalculatedOctantRewards(
                staking_proceeds=EstimatedStakingProceeds(),
                effective_deposits=user_deposits,
            ),
            history_service=history,
            simulated_pending_snapshot_service=simulated_pending_snapshot_service,
        )
