from dataclasses import dataclass
from typing import Dict

from app.context.manager import Context
from app.infrastructure import database


@dataclass
class SavedUserBudgets:
    def get_all_budgets(self, context: Context) -> Dict[str, int]:
        return database.budgets.get_all_by_epoch(context.epoch_details.epoch_num)
