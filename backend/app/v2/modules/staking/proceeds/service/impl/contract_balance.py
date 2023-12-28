from dataclasses import dataclass

from flask import current_app as app

from app.extensions import w3
from app.v2.context.context import Context


@dataclass
class ContractBalanceStakingProceeds:
    def get_staking_proceeds(self, context: Context) -> int:
        return (
            w3.eth.get_balance(app.config["WITHDRAWALS_TARGET_CONTRACT_ADDRESS"])
            - app.config["EPOCH_2_STAKING_PROCEEDS_SURPLUS"]
        )
