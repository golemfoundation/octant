from decimal import Decimal
from typing import Protocol, List, Dict, Tuple, Optional, runtime_checkable, Set

from app.context.manager import Context
from app.engine.projects.rewards import ProjectRewardDTO, ProjectRewardsResult
from app.engine.user.effective_deposit import UserDeposit
from app.modules.dto import (
    OctantRewardsDTO,
    AccountFundsDTO,
    AllocationDTO,
    ProjectDonationDTO,
    FinalizedSnapshotDTO,
    PendingSnapshotDTO,
    WithdrawableEth,
    UserAllocationRequestPayload,
    SignatureOpType,
    ProjectsMetadata,
    ScoreDelegationPayload,
)
from app.modules.history.dto import UserHistoryDTO
from app.modules.multisig_signatures.dto import Signature


@runtime_checkable
class OctantRewards(Protocol):
    def get_octant_rewards(self, context: Context) -> OctantRewardsDTO:
        ...


@runtime_checkable
class Leverage(Protocol):
    def get_leverage(self, context: Context) -> float:
        ...


@runtime_checkable
class UserEffectiveDeposits(Protocol):
    def get_user_effective_deposit(self, context: Context, user_address: str) -> int:
        ...


@runtime_checkable
class TotalEffectiveDeposits(Protocol):
    def get_total_effective_deposit(self, context: Context) -> int:
        ...


@runtime_checkable
class AllUserEffectiveDeposits(Protocol):
    def get_all_effective_deposits(
        self, context: Context
    ) -> Tuple[List[UserDeposit], int]:
        ...


@runtime_checkable
class DonorsAddresses(Protocol):
    def get_all_donors_addresses(self, context: Context) -> List[str]:
        ...


@runtime_checkable
class GetUserAllocationsProtocol(Protocol):
    def get_all_allocations(self, context: Context) -> List[AllocationDTO]:
        ...

    def get_allocations_by_project(
        self, context: Context, project: str
    ) -> List[ProjectDonationDTO]:
        ...

    def get_last_user_allocation(
        self, context: Context, user_address: str
    ) -> Tuple[List[AccountFundsDTO], Optional[bool]]:
        ...


@runtime_checkable
class AllocationManipulationProtocol(Protocol):
    def allocate(
        self, context: Context, payload: UserAllocationRequestPayload, **kwargs
    ):
        ...

    def revoke_previous_allocation(self, context: Context, user_address: str):
        ...


@runtime_checkable
class SimulateAllocation(Protocol):
    def simulate_allocation(
        self,
        context: Context,
        user_allocations: List[AllocationDTO],
        user_address: str,
    ) -> Tuple[float, List[ProjectRewardDTO]]:
        ...


@runtime_checkable
class UserPatronMode(Protocol):
    def get_all_patrons_addresses(self, context: Context) -> List[str]:
        ...


@runtime_checkable
class UserBudgets(Protocol):
    def get_all_budgets(self, context: Context) -> Dict[str, int]:
        ...

    def get_budget(self, context: Context, user_address: str) -> int:
        ...


@runtime_checkable
class UpcomingUserBudgets(Protocol):
    def get_budget(self, context: Context, user_address: str) -> int:
        ...


@runtime_checkable
class UserRewards(Protocol):
    def get_unused_rewards(self, context: Context) -> Dict[str, int]:
        ...


@runtime_checkable
class PendingSnapshots(Protocol):
    def create_pending_epoch_snapshot(self, context: Context) -> int:
        ...


@runtime_checkable
class CreateFinalizedSnapshots(Protocol):
    def create_finalized_epoch_snapshot(self, context: Context) -> int:
        ...


@runtime_checkable
class SimulateFinalizedSnapshots(Protocol):
    def simulate_finalized_epoch_snapshot(
        self, context: Context
    ) -> FinalizedSnapshotDTO:
        ...


@runtime_checkable
class SimulatePendingSnapshots(Protocol):
    def simulate_pending_epoch_snapshot(self, context: Context) -> PendingSnapshotDTO:
        ...


@runtime_checkable
class WithdrawalsService(Protocol):
    def get_withdrawable_eth(
        self, context: Context, address: str
    ) -> List[WithdrawableEth]:
        ...


@runtime_checkable
class EstimatedProjectRewardsService(Protocol):
    def get_project_rewards(self, context: Context) -> ProjectRewardsResult:
        ...


@runtime_checkable
class SavedProjectRewardsService(Protocol):
    def get_allocation_threshold(self, context: Context) -> int:
        ...


@runtime_checkable
class HistoryService(Protocol):
    def get_user_history(
        self, context: Context, user_address: str, cursor: str = None, limit: int = 20
    ) -> UserHistoryDTO:
        ...


@runtime_checkable
class MultisigSignatures(Protocol):
    def get_last_pending_signature(
        self, context: Context, user_address: str, op_type: SignatureOpType
    ) -> Signature:
        ...

    def approve_pending_signatures(
        self, context: Context, op_type: SignatureOpType
    ) -> List[Signature]:
        ...

    def apply_staged_signatures(self, context: Context, signature_id: int):
        ...

    def save_pending_signature(
        self,
        context: Context,
        user_address: str,
        op_type: SignatureOpType,
        signature_data: dict,
    ):
        ...


@runtime_checkable
class UserTos(Protocol):
    def has_user_agreed_to_terms_of_service(
        self, context: Context, user_address: str
    ) -> bool:
        ...

    def add_user_terms_of_service_consent(
        self,
        context: Context,
        user_address: str,
        consent_signature: str,
        ip_address: str,
    ):
        ...


@runtime_checkable
class ProjectsMetadataService(Protocol):
    def get_projects_metadata(self, context: Context) -> ProjectsMetadata:
        ...


@runtime_checkable
class UserAllocationNonceProtocol(Protocol):
    def get_user_next_nonce(self, user_address: str) -> int:
        ...


@runtime_checkable
class ScoreDelegation(Protocol):
    def delegate(self, context: Context, payload: ScoreDelegationPayload):
        ...

    def recalculate(self, context: Context, payload: ScoreDelegationPayload):
        ...

    def check(self, context: Context, addresses: List[str]) -> Set[Tuple[str, str]]:
        ...


@runtime_checkable
class UniquenessQuotients(Protocol):
    def retrieve(
        self, context: Context, user_address: str, should_save: bool = False
    ) -> Decimal:
        ...
