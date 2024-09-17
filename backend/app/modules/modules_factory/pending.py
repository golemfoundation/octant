from typing import Protocol

from app.modules.dto import SignatureOpType
from app.modules.modules_factory.protocols import (
    UserPatronMode,
    UserRewards,
    UserEffectiveDeposits,
    TotalEffectiveDeposits,
    Leverage,
    SimulateAllocation,
    SimulateFinalizedSnapshots,
    UserBudgets,
    WithdrawalsService,
    EstimatedProjectRewardsService,
    OctantRewards,
    DonorsAddresses,
    AllocationManipulationProtocol,
    GetUserAllocationsProtocol,
    SavedProjectRewardsService,
    MultisigSignatures,
    ProjectsMetadataService,
    UniquenessQuotients,
)
from app.modules.multisig_signatures.service.offchain import OffchainMultisigSignatures
from app.modules.octant_rewards.general.service.pending import PendingOctantRewards
from app.modules.octant_rewards.matched.pending import PendingOctantMatchedRewards
from app.modules.projects.metadata.service.projects_metadata import (
    StaticProjectsMetadataService,
)
from app.modules.projects.rewards.service.estimated import EstimatedProjectRewards
from app.modules.projects.rewards.service.finalizing import FinalizingProjectRewards
from app.modules.snapshots.finalized.service.simulated import (
    SimulatedFinalizedSnapshots,
)
from app.modules.uq.service.preliminary import PreliminaryUQ
from app.modules.user.allocations.nonce.service.saved import SavedUserAllocationsNonce
from app.modules.user.allocations.service.pending import (
    PendingUserAllocations,
    PendingUserAllocationsVerifier,
)
from app.modules.user.antisybil.service.passport import (
    GitcoinPassportAntisybil,
)
from app.modules.user.antisybil.service.holonym import HolonymAntisybil
from app.modules.user.budgets.service.saved import SavedUserBudgets
from app.modules.user.deposits.service.saved import SavedUserDeposits
from app.modules.user.patron_mode.service.events_based import EventsBasedUserPatronMode
from app.modules.user.rewards.service.calculated import CalculatedUserRewards
from app.modules.withdrawals.service.pending import PendingWithdrawals
from app.pydantic import Model
from app.shared.blockchain_types import compare_blockchain_types, ChainTypes
from app.constants import UQ_THRESHOLD_MAINNET, UQ_THRESHOLD_NOT_MAINNET


class PendingOctantRewardsService(OctantRewards, Leverage, Protocol):
    pass


class PendingUserDeposits(UserEffectiveDeposits, TotalEffectiveDeposits, Protocol):
    pass


class PendingUserAllocationsProtocol(
    DonorsAddresses,
    AllocationManipulationProtocol,
    GetUserAllocationsProtocol,
    SimulateAllocation,
    Protocol,
):
    pass


class PendingProjectRewardsProtocol(
    EstimatedProjectRewardsService, SavedProjectRewardsService, Protocol
):
    pass


class PendingServices(Model):
    user_deposits_service: PendingUserDeposits
    octant_rewards_service: PendingOctantRewardsService
    user_allocations_service: PendingUserAllocationsProtocol
    user_patron_mode_service: UserPatronMode
    user_budgets_service: UserBudgets
    user_rewards_service: UserRewards
    finalized_snapshots_service: SimulateFinalizedSnapshots
    withdrawals_service: WithdrawalsService
    project_rewards_service: PendingProjectRewardsProtocol
    multisig_signatures_service: MultisigSignatures
    projects_metadata_service: ProjectsMetadataService
    uniqueness_quotients: UniquenessQuotients

    @staticmethod
    def create(chain_id: int) -> "PendingServices":
        events_based_patron_mode = EventsBasedUserPatronMode()
        project_rewards = FinalizingProjectRewards()
        saved_user_budgets = SavedUserBudgets()
        user_nonce = SavedUserAllocationsNonce()

        is_mainnet = compare_blockchain_types(chain_id, ChainTypes.MAINNET)
        uq_threshold = UQ_THRESHOLD_MAINNET if is_mainnet else UQ_THRESHOLD_NOT_MAINNET
        uniqueness_quotients = PreliminaryUQ(
            passport=GitcoinPassportAntisybil(),
            holonym=HolonymAntisybil(),
            budgets=saved_user_budgets,
            uq_threshold=uq_threshold,
        )

        allocations_verifier = PendingUserAllocationsVerifier(
            user_nonce=user_nonce,
            user_budgets=saved_user_budgets,
            patrons_mode=events_based_patron_mode,
        )
        octant_matched_rewards = PendingOctantMatchedRewards(
            patrons_mode=events_based_patron_mode
        )

        pending_user_allocations = PendingUserAllocations(
            octant_rewards=octant_matched_rewards,
            verifier=allocations_verifier,
            uniqueness_quotients=uniqueness_quotients,
        )
        user_rewards = CalculatedUserRewards(
            user_budgets=saved_user_budgets,
            patrons_mode=events_based_patron_mode,
            allocations=pending_user_allocations,
        )
        octant_rewards = PendingOctantRewards(
            patrons_mode=events_based_patron_mode,
            user_rewards=user_rewards,
            project_rewards=project_rewards,
            octant_matched_rewards=octant_matched_rewards,
        )

        finalized_snapshots_service = SimulatedFinalizedSnapshots(
            octant_rewards=octant_rewards,
            user_rewards=user_rewards,
            patrons_mode=events_based_patron_mode,
            project_rewards=project_rewards,
        )
        withdrawals_service = PendingWithdrawals(user_rewards=user_rewards)
        project_rewards = EstimatedProjectRewards(octant_rewards=octant_rewards)

        is_mainnet = compare_blockchain_types(
            chain_id=chain_id, expected_chain=ChainTypes.MAINNET
        )
        multisig_signatures = OffchainMultisigSignatures(
            verifiers={SignatureOpType.ALLOCATION: allocations_verifier},
            is_mainnet=is_mainnet,
        )

        return PendingServices(
            user_deposits_service=SavedUserDeposits(),
            octant_rewards_service=octant_rewards,
            user_allocations_service=pending_user_allocations,
            user_patron_mode_service=events_based_patron_mode,
            finalized_snapshots_service=finalized_snapshots_service,
            user_budgets_service=saved_user_budgets,
            user_rewards_service=user_rewards,
            withdrawals_service=withdrawals_service,
            project_rewards_service=project_rewards,
            multisig_signatures_service=multisig_signatures,
            projects_metadata_service=StaticProjectsMetadataService(),
            uniqueness_quotients=uniqueness_quotients,
        )
