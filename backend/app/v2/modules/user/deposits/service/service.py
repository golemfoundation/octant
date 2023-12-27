from typing import Tuple, List, Protocol

from app.v2.context.context import Context
from app.v2.engine.user.effective_deposit import UserDeposit


class UserDepositsService(Protocol):
    def get_all_effective_deposits(
        self, context: Context
    ) -> Tuple[List[UserDeposit], int]:
        ...

    def get_total_effective_deposit(self, context: Context) -> int:
        ...

    def get_user_effective_deposit(self, context: Context, user_address: str) -> int:
        ...
