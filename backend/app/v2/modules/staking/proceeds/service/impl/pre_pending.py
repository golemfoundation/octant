from dataclasses import dataclass

from flask import current_app as app

from app.extensions import w3
from app.v2.context.context import EpochContext
from app.v2.modules.staking.proceeds.service.impl.default import (
    DefaultStakingProceedsService,
)


@dataclass
class PrePendingStakingProceedsService(DefaultStakingProceedsService):
    def get_staking_proceeds(self, context: EpochContext) -> int:
        return w3.eth.get_balance(app.config["WITHDRAWALS_TARGET_CONTRACT_ADDRESS"])
