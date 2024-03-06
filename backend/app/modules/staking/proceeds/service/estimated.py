from app.context.manager import Context
from app.modules.staking.proceeds.core import estimate_staking_proceeds
from app.pydantic import Model


class EstimatedStakingProceeds(Model):
    def get_staking_proceeds(self, context: Context) -> int:
        return estimate_staking_proceeds(context.epoch_details.duration_sec)
