from dataclasses import dataclass
from decimal import Decimal
from typing import Protocol, Optional

from dataclass_wizard import JSONWizard

from app.context.context import Context


@dataclass
class OctantRewards(JSONWizard):
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


class OctantRewardsService(Protocol):
    def get_octant_rewards(self, context: Context) -> OctantRewards:
        ...
