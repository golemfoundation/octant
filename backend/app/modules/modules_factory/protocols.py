from typing import Protocol, List, Dict, Tuple, runtime_checkable

from app.context.manager import Context
from app.engine.projects.rewards import ProjectRewardDTO
from app.engine.user.effective_deposit import UserDeposit
from app.modules.dto import (
    OctantRewardsDTO,
    AllocationDTO,
    FinalizedSnapshotDTO,
    PendingSnapshotDTO,
    WithdrawableEth,
)


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
    ) -> list[WithdrawableEth]:
        ...
