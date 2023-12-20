from dataclasses import dataclass

from app.v2.context.context import EpochContext
from app.v2.modules.staking.proceeds.core import estimate_staking_proceeds
from app.v2.modules.staking.proceeds.service.impl.pre_pending import (
    PrePendingStakingProceedsService,
)


@dataclass
class CurrentStakingProceedsService(PrePendingStakingProceedsService):
    def get_staking_proceeds(self, context: EpochContext) -> int:
        return estimate_staking_proceeds(context.epoch_details.duration_sec)
