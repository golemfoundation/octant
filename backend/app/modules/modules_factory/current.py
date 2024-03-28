from typing import Protocol

import app.modules.staking.proceeds.service.aggregated as aggregated
import app.modules.staking.proceeds.service.contract_balance as contract_balance
from app.modules.dto import SignatureOpType
from app.modules.history.service.full import FullHistory
from app.modules.modules_factory.protocols import (
    OctantRewards,
    UserEffectiveDeposits,
    TotalEffectiveDeposits,
    HistoryService,
    MultisigSignatures,
    UserTos,
)
from app.modules.modules_factory.protocols import SimulatePendingSnapshots
from app.modules.multisig_signatures.service.offchain import OffchainMultisigSignatures
from app.modules.octant_rewards.service.calculated import CalculatedOctantRewards
from app.modules.snapshots.pending.service.simulated import SimulatedPendingSnapshots
from app.modules.staking.proceeds.service.estimated import EstimatedStakingProceeds
from app.modules.user.allocations.service.saved import SavedUserAllocations
from app.modules.user.deposits.service.calculated import CalculatedUserDeposits
from app.modules.user.events_generator.service.db_and_graph import (
    DbAndGraphEventsGenerator,
)
from app.modules.user.patron_mode.service.events_based import EventsBasedUserPatronMode
from app.modules.user.tos.service.initial import InitialUserTos, InitialUserTosVerifier
from app.modules.withdrawals.service.finalized import FinalizedWithdrawals
from app.pydantic import Model
from app.shared.blockchain_types import compare_blockchain_types, ChainTypes


class CurrentUserDeposits(UserEffectiveDeposits, TotalEffectiveDeposits, Protocol):
    pass


class CurrentServices(Model):
    user_allocations_service: SavedUserAllocations
    user_deposits_service: CurrentUserDeposits
    user_tos_service: UserTos
    octant_rewards_service: OctantRewards
    history_service: HistoryService
    simulated_pending_snapshot_service: SimulatePendingSnapshots
    multisig_signatures_service: MultisigSignatures

    @staticmethod
    def _prepare_simulation_data(
        is_mainnet: bool, user_deposits: CalculatedUserDeposits
    ) -> CalculatedOctantRewards:
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

        is_mainnet = compare_blockchain_types(chain_id, ChainTypes.MAINNET)

        octant_rewards = CurrentServices._prepare_simulation_data(
            is_mainnet, user_deposits
        )
        simulated_pending_snapshot_service = SimulatedPendingSnapshots(
            effective_deposits=user_deposits, octant_rewards=octant_rewards
        )
        user_allocations = SavedUserAllocations()
        user_withdrawals = FinalizedWithdrawals()
        tos_verifier = InitialUserTosVerifier()
        user_tos = InitialUserTos(verifier=tos_verifier)
        patron_donations = EventsBasedUserPatronMode()
        history = FullHistory(
            user_deposits=user_deposits,
            user_allocations=user_allocations,
            user_withdrawals=user_withdrawals,
            patron_donations=patron_donations,
        )

        multisig_signatures = OffchainMultisigSignatures(
            verifiers={SignatureOpType.TOS: tos_verifier}, is_mainnet=is_mainnet
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
            multisig_signatures_service=multisig_signatures,
            user_tos_service=user_tos,
        )
