from dataclasses import dataclass
from typing import Tuple, List

from flask import current_app as app

from app.extensions import glm
from app.context.context import Context
from app.engine.user.effective_deposit import UserDeposit


@dataclass
class ContractBalanceUserDeposits:
    def get_all_effective_deposits(
        self, context: Context
    ) -> Tuple[List[UserDeposit], int]:
        # TODO implement
        ...

    def get_total_effective_deposit(self, context: Context) -> int:
        return glm.balance_of(app.config["DEPOSITS_CONTRACT_ADDRESS"])

    def get_user_effective_deposit(self, context: Context, user_address: str) -> int:
        return glm.balance_of(user_address)
