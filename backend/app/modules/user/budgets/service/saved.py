from typing import Dict

from app.context.manager import Context
from app.exceptions import BudgetNotFound
from app.infrastructure import database
from app.pydantic import Model


class SavedUserBudgets(Model):
    def get_all_budgets(self, context: Context) -> Dict[str, int]:
        return database.budgets.get_all_by_epoch(context.epoch_details.epoch_num)

    def get_budget(self, context: Context, user_address: str) -> int:
        epoch_num = context.epoch_details.epoch_num
        budget = database.budgets.get_by_user_address_and_epoch(
            user_address, context.epoch_details.epoch_num
        )

        if budget is None:
            raise BudgetNotFound(user_address, epoch_num)

        return budget
