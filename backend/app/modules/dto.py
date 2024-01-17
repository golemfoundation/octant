from dataclasses import dataclass
from decimal import Decimal
from typing import Optional

from dataclass_wizard import JSONWizard

from app.engine.projects.rewards import AllocationPayload


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


@dataclass(frozen=True)
class AllocationDTO(AllocationPayload, JSONWizard):
    user_address: Optional[str] = None
