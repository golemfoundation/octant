from typing import Protocol, List, Dict, Tuple

from app.context.manager import Context
from app.engine.projects.rewards import ProjectRewardDTO
from app.engine.user.effective_deposit import UserDeposit
from app.modules.dto import OctantRewardsDTO, AllocationDTO


class OctantRewards(Protocol):
    def get_octant_rewards(self, context: Context) -> OctantRewardsDTO:
        ...


class Leverage(Protocol):
    def get_leverage(self, context: Context) -> float:
        ...


class UserEffectiveDeposits(Protocol):
    def get_user_effective_deposit(self, context: Context, user_address: str) -> int:
        ...


class TotalEffectiveDeposits(Protocol):
    def get_total_effective_deposit(self, context: Context) -> int:
        ...


class AllUserEffectiveDeposits(Protocol):
    def get_all_effective_deposits(
        self, context: Context
    ) -> Tuple[List[UserDeposit], int]:
        ...


class DonorsAddresses(Protocol):
    def get_all_donors_addresses(self, context: Context) -> List[str]:
        ...


class SimulateAllocation(Protocol):
    def simulate_allocation(
        self,
        context: Context,
        user_allocations: List[AllocationDTO],
        user_address: str,
    ) -> Tuple[float, List[ProjectRewardDTO]]:
        ...


class UserPatronMode(Protocol):
    def get_all_patrons_addresses(self, context: Context) -> List[str]:
        ...


class UserRewards(Protocol):
    def get_unused_rewards(self, context: Context) -> Dict[str, int]:
        ...


class SnapshotsService(Protocol):
    def create_pending_epoch_snapshot(self, context: Context) -> int:
        ...
