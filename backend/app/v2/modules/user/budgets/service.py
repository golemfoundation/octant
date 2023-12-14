from dataclasses import dataclass
from typing import List, Tuple

from flask import current_app as app

from app.context.context import EpochContext
from app.v2.engine.user.effective_deposit import UserDeposit
from app.v2.modules.user.budgets.core import calculate_budgets
from app.v2.modules.user.budgets.db import save_budgets


@dataclass
class UserBudgetsCalculator:
    def calculate_budgets(
        self,
        context: EpochContext,
        user_deposits: List[UserDeposit],
        total_effective_deposits: int,
        individual_rewards: int,
    ) -> List[Tuple[str, int]]:
        epoch_details = context.epoch_details
        app.logger.debug(f"Calculating user budgets for epoch {epoch_details.epoch_no}")

        budget_calculator = context.epoch_settings.user.budget

        return calculate_budgets(
            budget_calculator,
            user_deposits,
            total_effective_deposits,
            individual_rewards,
        )


@dataclass
class UserBudgetsCreator:
    def save_budgets(self, epoch: int, budgets: List[Tuple[str, int]]):
        save_budgets(epoch=epoch, budgets=budgets)
