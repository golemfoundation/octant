from dataclasses import dataclass

from app.v2.context.context import EpochContext
from app.v2.engine.user.budget import UserBudgetPayload
from app.v2.modules.user.budgets.service.impl.default import DefaultUserBudgetsService


@dataclass
class CurrentUserBudgetsService(DefaultUserBudgetsService):
    def estimate_epoch_budget(
        self,
        context: EpochContext,
        lock_duration: int,
        glm_amount: int,
    ) -> int:
        budget_calculator = context.epoch_settings.user.budget
        rewards = context.octant_rewards
        user_effective_deposit = self.user_deposits_service.estimate_effective_deposit(
            context, glm_amount, lock_duration
        )
        return budget_calculator.calculate_budget(
            UserBudgetPayload(
                user_effective_deposit=user_effective_deposit,
                total_effective_deposit=rewards.total_effective_deposit,
                all_individual_rewards=rewards.individual_rewards,
            )
        )
