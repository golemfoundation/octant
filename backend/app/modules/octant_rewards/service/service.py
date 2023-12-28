from dataclasses import dataclass
from decimal import Decimal
from typing import Protocol

from app.context.context import Context


@dataclass
class OctantRewards:
    eth_proceeds: int
    locked_ratio: Decimal
    total_rewards: int
    individual_rewards: int
    total_effective_deposit: int


class OctantRewardsService(Protocol):
    def get_octant_rewards(self, context: Context) -> OctantRewards:
        ...
