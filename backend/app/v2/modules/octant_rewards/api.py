from abc import abstractmethod, ABC
from dataclasses import dataclass
from decimal import Decimal

from app.v2.context.context import EpochContext
from app.v2.modules.staking.proceeds.api import StakingProceedsService
from app.v2.modules.user.deposits.api import UserDepositsService


@dataclass
class OctantRewards:
    eth_proceeds: int
    locked_ratio: Decimal
    total_rewards: int
    individual_rewards: int
    total_effective_deposit: int


@dataclass
class OctantRewardsService(ABC):
    staking_proceeds_service: StakingProceedsService
    user_deposits_service: UserDepositsService

    @abstractmethod
    def get_octant_rewards(self, context: EpochContext) -> OctantRewards:
        pass
