from dataclasses import dataclass

from app.context.context import Context


@dataclass
class SavedStakingProceeds:
    def get_staking_proceeds(self, context: Context) -> int:
        return context.octant_rewards.staking_proceeds
