from dataclasses import dataclass

from flask import current_app as app

from app.extensions import glm
from app.v2.context.context import EpochContext
from app.v2.modules.user.deposits.service.impl.current import CurrentUserDepositsService


@dataclass
class FutureUserDepositsService(CurrentUserDepositsService):
    def get_total_effective_deposit(self, context: EpochContext) -> int:
        return glm.balance_of(app.config["DEPOSITS_CONTRACT_ADDRESS"])

    def get_user_effective_deposit(
        self, context: EpochContext, user_address: str
    ) -> int:
        return glm.balance_of(user_address)
