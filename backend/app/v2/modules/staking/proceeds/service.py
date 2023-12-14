from dataclasses import dataclass

from app.extensions import w3
from flask import current_app as app


@dataclass
class StakingBalanceReader:
    def get_withdrawals_target_balance(self) -> int:
        return w3.eth.get_balance(app.config["WITHDRAWALS_TARGET_CONTRACT_ADDRESS"])
