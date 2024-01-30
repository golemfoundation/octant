from typing import Dict

from app.context.manager import Context
from app.infrastructure import database
from app.pydantic import Model


class SavedUserBudgets(Model):
    def get_all_budgets(self, context: Context) -> Dict[str, int]:
        return database.budgets.get_all_by_epoch(context.epoch_details.epoch_num)
