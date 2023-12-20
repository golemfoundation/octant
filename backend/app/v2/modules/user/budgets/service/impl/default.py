from dataclasses import dataclass

from app.v2.context.context import EpochContext
from app.v2.modules.user.budgets.api import UserBudgetsService


@dataclass
class DefaultUserBudgetsService(UserBudgetsService):
    def estimate_epoch_budget(
        self,
        context: EpochContext,
        lock_duration: int,
        glm_amount: int,
    ) -> int:
        raise NotImplementedError
