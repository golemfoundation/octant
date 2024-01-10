from typing import Protocol, List, Dict, Tuple

from app.context.manager import Context
from app.engine.user.effective_deposit import UserDeposit
from app.modules.dto import OctantRewardsDTO


class OctantRewards(Protocol):
    def get_octant_rewards(self, context: Context) -> OctantRewardsDTO:
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


class UserAllocations(Protocol):
    def get_all_donors_addresses(self, context: Context) -> List[str]:
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
