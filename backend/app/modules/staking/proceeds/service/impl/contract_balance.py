from dataclasses import dataclass

from flask import current_app as app

from app.context.context import Context
from app.extensions import w3


@dataclass
class ContractBalanceStakingProceeds:
    def get_staking_proceeds(self, context: Context) -> int:
        return (
            w3.eth.get_balance(app.config["WITHDRAWALS_TARGET_CONTRACT_ADDRESS"])
            - app.config["EPOCH_2_STAKING_PROCEEDS_SURPLUS"]
        )
