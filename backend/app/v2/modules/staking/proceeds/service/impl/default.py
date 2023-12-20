from dataclasses import dataclass

from app.v2.context.context import EpochContext
from app.v2.modules.staking.proceeds.api import StakingProceedsService


@dataclass
class DefaultStakingProceedsService(StakingProceedsService):
    def get_staking_proceeds(self, context: EpochContext) -> int:
        return context.octant_rewards.eth_proceeds
