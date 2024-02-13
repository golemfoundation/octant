from flask import current_app as app

from app.extensions import w3
from app.pydantic import Model


class ContractBalanceStakingProceeds(Model):
    def get_staking_proceeds(self, _) -> int:
        return (
            w3.eth.get_balance(app.config["WITHDRAWALS_TARGET_CONTRACT_ADDRESS"])
            - app.config["EPOCH_2_STAKING_PROCEEDS_SURPLUS"]
        )
