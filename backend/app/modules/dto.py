from dataclasses import dataclass
from decimal import Decimal
from enum import StrEnum
from typing import Optional, List

from dataclass_wizard import JSONWizard

from app.engine.projects.rewards import AllocationPayload

from app.engine.user.effective_deposit import UserDeposit
from app.modules.snapshots.pending import UserBudgetInfo


@dataclass(frozen=True)
class AccountFundsDTO(JSONWizard):
    address: str
    amount: int

    def __iter__(self):
        yield self.address
        yield self.amount


@dataclass(frozen=True)
class ProjectAccountFundsDTO(AccountFundsDTO, JSONWizard):
    matched: int


@dataclass(frozen=True)
class FinalizedSnapshotDTO(JSONWizard):
    patrons_rewards: int
    matched_rewards: int
    projects_rewards: List[ProjectAccountFundsDTO]
    user_rewards: List[AccountFundsDTO]
    total_withdrawals: int
    leftover: int
    merkle_root: str


@dataclass
class OctantRewardsDTO(JSONWizard):
    # Data available to a pending epoch
    staking_proceeds: int
    locked_ratio: Decimal
    total_rewards: int
    individual_rewards: int
    total_effective_deposit: int
    operational_cost: int
    # Data available to a finalized epoch
    patrons_rewards: Optional[int] = None
    matched_rewards: Optional[int] = None
    total_withdrawals: Optional[int] = None
    leftover: Optional[int] = None
    # Data available starting from Epoch 3
    ppf: Optional[int] = None
    community_fund: Optional[int] = None


@dataclass(frozen=True)
class PendingSnapshotDTO(JSONWizard):
    rewards: OctantRewardsDTO
    user_deposits: List[UserDeposit]
    user_budgets: List[UserBudgetInfo]


@dataclass(frozen=True)
class AllocationDTO(AllocationPayload, JSONWizard):
    user_address: Optional[str] = None


class WithdrawalStatus(StrEnum):
    PENDING = "pending"
    AVAILABLE = "available"


@dataclass(frozen=True)
class WithdrawableEth:
    epoch: int
    amount: int
    proof: list[str]
    status: WithdrawalStatus
