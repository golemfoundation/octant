from dataclasses import dataclass

from flask import current_app as app

from app.extensions import glm, deposits


@dataclass
class ContractBalanceUserDeposits:
    def get_total_effective_deposit(self, _) -> int:
        return glm.balance_of(app.config["DEPOSITS_CONTRACT_ADDRESS"])

    def get_user_effective_deposit(self, _, user_address: str) -> int:
        return deposits.balance_of(user_address)
