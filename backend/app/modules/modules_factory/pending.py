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
)
from app.modules.multisig_signatures.service.offchain import OffchainMultisigSignatures
from app.modules.octant_rewards.service.pending import PendingOctantRewards
from app.modules.project_rewards.service.estimated import EstimatedProjectRewards
from app.modules.snapshots.finalized.service.simulated import (
    SimulatedFinalizedSnapshots,
)
from app.modules.user.allocations.service.pending import (
    PendingUserAllocations,
    PendingUserAllocationsVerifier,
)
from app.modules.user.budgets.service.saved import SavedUserBudgets
from app.modules.user.deposits.service.saved import SavedUserDeposits
from app.modules.user.patron_mode.service.events_based import EventsBasedUserPatronMode
from app.modules.user.rewards.service.calculated import CalculatedUserRewards
from app.modules.withdrawals.service.pending import PendingWithdrawals
from app.pydantic import Model
from app.shared.blockchain_types import compare_blockchain_types, ChainTypes


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

    @staticmethod
    def create(chain_id: int) -> "PendingServices":
        events_based_patron_mode = EventsBasedUserPatronMode()
        octant_rewards = PendingOctantRewards(patrons_mode=events_based_patron_mode)
        saved_user_budgets = SavedUserBudgets()
        allocations_verifier = PendingUserAllocationsVerifier(
            user_budgets=saved_user_budgets,
            patrons_mode=events_based_patron_mode,
        )
        pending_user_allocations = PendingUserAllocations(
            octant_rewards=octant_rewards, verifier=allocations_verifier
        )
        user_rewards = CalculatedUserRewards(
            user_budgets=saved_user_budgets,
            patrons_mode=events_based_patron_mode,
            allocations=pending_user_allocations,
        )
        finalized_snapshots_service = SimulatedFinalizedSnapshots(
            octant_rewards=octant_rewards,
            user_rewards=user_rewards,
            patrons_mode=events_based_patron_mode,
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
        )
