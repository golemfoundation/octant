from dataclasses import dataclass

from app.context.manager import Context
from app.modules.staking.proceeds.core import estimate_staking_proceeds


@dataclass
class EstimatedStakingProceeds:
    def get_staking_proceeds(self, context: Context) -> int:
        return estimate_staking_proceeds(context.epoch_details.duration_sec)
