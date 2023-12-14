from dataclasses import dataclass
from typing import List, Tuple

from flask import current_app as app

from app.context.context import EpochContext
from app.v2.engine.user.budget import UserBudgetPayload
from app.v2.engine.user.effective_deposit import UserDeposit
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

        budgets = []
        for address, effective_deposit, _ in user_deposits:
            user_budget = budget_calculator.calculate_budget(
                UserBudgetPayload(
                    user_effective_deposit=effective_deposit,
                    total_effective_deposit=total_effective_deposits,
                    all_individual_rewards=individual_rewards,
                )
            )
            budgets.append((address, user_budget))

        return budgets


@dataclass
class UserBudgetsCreator:
    def save_budgets(self, epoch: int, budgets: List[Tuple[str, int]]):
        save_budgets(epoch=epoch, budgets=budgets)
