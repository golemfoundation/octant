from typing import Protocol

import app.modules.staking.proceeds.service.aggregated as aggregated
import app.modules.staking.proceeds.service.contract_balance as contract_balance
from app.constants import (
    UQ_THRESHOLD_MAINNET,
    UQ_THRESHOLD_NOT_MAINNET,
    TIMEOUT_LIST_NOT_MAINNET,
    TIMEOUT_LIST,
    SABLIER_UNLOCK_GRACE_PERIOD_24_HRS,
    TEST_SABLIER_UNLOCK_GRACE_PERIOD_15_MIN,
    GUEST_LIST,
    GUEST_LIST_NOT_MAINNET,
)
from app.modules.dto import SignatureOpType
from app.modules.history.service.full import FullHistory
from app.modules.modules_factory.protocols import (
    OctantRewards,
    UserEffectiveDeposits,
    TotalEffectiveDeposits,
    HistoryService,
    MultisigSignatures,
    UserTos,
    ProjectsMetadataService,
    UserAllocationNonceProtocol,
    ScoreDelegation,
    UniquenessQuotients,
    ProjectsDetailsService,
    SablierStreamsService,
)
from app.modules.modules_factory.protocols import SimulatePendingSnapshots
from app.modules.multisig_signatures.service.offchain import OffchainMultisigSignatures
from app.modules.octant_rewards.general.service.calculated import (
    CalculatedOctantRewards,
)
from app.modules.projects.details.service.projects_details import (
    StaticProjectsDetailsService,
)
from app.modules.projects.metadata.service.projects_metadata import (
    StaticProjectsMetadataService,
)
from app.modules.score_delegation.service.simple_obfuscation import (
    SimpleObfuscationDelegationVerifier,
    SimpleObfuscationDelegation,
)
from app.modules.snapshots.pending.service.simulated import SimulatedPendingSnapshots
from app.modules.staking.proceeds.service.estimated import EstimatedStakingProceeds
from app.modules.uq.service.preliminary import PreliminaryUQ
from app.modules.user.allocations.nonce.service.saved import SavedUserAllocationsNonce
from app.modules.user.allocations.service.saved import SavedUserAllocations
from app.modules.user.antisybil.service.initial import GitcoinPassportAntisybil
from app.modules.user.budgets.service.upcoming import UpcomingUserBudgets
from app.modules.user.deposits.service.calculated import CalculatedUserDeposits
from app.modules.user.events_generator.service.db_and_graph import (
    DbAndGraphEventsGenerator,
)
from app.modules.user.patron_mode.service.events_based import EventsBasedUserPatronMode
from app.modules.user.sablier_streams.service.sablier_streams import (
    UserSablierStreamsService,
)
from app.modules.user.tos.service.initial import InitialUserTos, InitialUserTosVerifier
from app.modules.withdrawals.service.finalized import FinalizedWithdrawals
from app.pydantic import Model
from app.shared.blockchain_types import compare_blockchain_types, ChainTypes


class CurrentUserDeposits(UserEffectiveDeposits, TotalEffectiveDeposits, Protocol):
    pass


class CurrentServices(Model):
    user_allocations_nonce_service: UserAllocationNonceProtocol
    user_deposits_service: CurrentUserDeposits
    user_tos_service: UserTos
    user_antisybil_service: GitcoinPassportAntisybil
    octant_rewards_service: OctantRewards
    sablier_streams_service: SablierStreamsService
    history_service: HistoryService
    simulated_pending_snapshot_service: SimulatePendingSnapshots
    multisig_signatures_service: MultisigSignatures
    projects_metadata_service: ProjectsMetadataService
    projects_details_service: ProjectsDetailsService
    user_budgets_service: UpcomingUserBudgets
    score_delegation_service: ScoreDelegation
    uniqueness_quotients: UniquenessQuotients

    @staticmethod
    def _prepare_simulation_data(
        is_mainnet: bool, user_deposits: CalculatedUserDeposits
    ) -> CalculatedOctantRewards:
        octant_rewards = CalculatedOctantRewards(
            staking_proceeds=(
                aggregated.AggregatedStakingProceeds()
                if is_mainnet
                else contract_balance.ContractBalanceStakingProceeds()
            ),
            effective_deposits=user_deposits,
        )

        return octant_rewards

    @staticmethod
    def create(chain_id: int) -> "CurrentServices":
        is_mainnet = compare_blockchain_types(chain_id, ChainTypes.MAINNET)
        sablier_unlock_grace_period = (
            SABLIER_UNLOCK_GRACE_PERIOD_24_HRS
            if is_mainnet
            else TEST_SABLIER_UNLOCK_GRACE_PERIOD_15_MIN
        )
        user_deposits = CalculatedUserDeposits(
            events_generator=DbAndGraphEventsGenerator(
                sablier_unlock_grace_period=sablier_unlock_grace_period
            )
        )

        octant_rewards = CurrentServices._prepare_simulation_data(
            is_mainnet, user_deposits
        )
        simulated_pending_snapshot_service = SimulatedPendingSnapshots(
            effective_deposits=user_deposits, octant_rewards=octant_rewards
        )
        user_allocations = SavedUserAllocations()
        user_allocations_nonce = SavedUserAllocationsNonce()
        user_withdrawals = FinalizedWithdrawals()

        timeout_list = TIMEOUT_LIST if is_mainnet else TIMEOUT_LIST_NOT_MAINNET
        guest_list = GUEST_LIST if is_mainnet else GUEST_LIST_NOT_MAINNET
        user_antisybil_service = GitcoinPassportAntisybil(
            timeout_list=timeout_list, guest_list=guest_list
        )

        tos_verifier = InitialUserTosVerifier()
        user_tos = InitialUserTos(verifier=tos_verifier)
        patron_donations = EventsBasedUserPatronMode()
        history = FullHistory(
            user_deposits=user_deposits,
            user_allocations=user_allocations,
            user_withdrawals=user_withdrawals,
            patron_donations=patron_donations,
        )

        score_delegation_verifier = SimpleObfuscationDelegationVerifier()
        score_delegation = SimpleObfuscationDelegation(
            verifier=score_delegation_verifier,
            antisybil=user_antisybil_service,
            user_deposits_service=user_deposits,
            timeout_list=timeout_list,
        )

        multisig_signatures = OffchainMultisigSignatures(
            verifiers={SignatureOpType.TOS: tos_verifier}, is_mainnet=is_mainnet
        )
        octant_rewards = CalculatedOctantRewards(
            staking_proceeds=EstimatedStakingProceeds(),
            effective_deposits=user_deposits,
        )
        user_budgets = UpcomingUserBudgets(
            simulated_pending_snapshot_service=SimulatedPendingSnapshots(
                effective_deposits=user_deposits, octant_rewards=octant_rewards
            )
        )
        uq_threshold = UQ_THRESHOLD_MAINNET if is_mainnet else UQ_THRESHOLD_NOT_MAINNET
        uniqueness_quotients = PreliminaryUQ(
            antisybil=GitcoinPassportAntisybil(
                timeout_list=timeout_list, guest_list=guest_list
            ),
            budgets=user_budgets,
            uq_threshold=uq_threshold,
        )

        return CurrentServices(
            user_allocations_nonce_service=user_allocations_nonce,
            user_deposits_service=user_deposits,
            octant_rewards_service=octant_rewards,
            history_service=history,
            simulated_pending_snapshot_service=simulated_pending_snapshot_service,
            multisig_signatures_service=multisig_signatures,
            user_tos_service=user_tos,
            user_antisybil_service=user_antisybil_service,
            sablier_streams_service=UserSablierStreamsService(),
            projects_metadata_service=StaticProjectsMetadataService(),
            projects_details_service=StaticProjectsDetailsService(),
            user_budgets_service=user_budgets,
            score_delegation_service=score_delegation,
            uniqueness_quotients=uniqueness_quotients,
        )
