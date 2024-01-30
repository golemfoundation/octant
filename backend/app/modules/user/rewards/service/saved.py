from typing import Dict, Protocol, List, runtime_checkable

from app.context.manager import Context
from app.modules.user.rewards.core import get_unused_rewards
from app.pydantic import Model


@runtime_checkable
class UserAllocations(Protocol):
    def get_all_donors_addresses(self, context: Context) -> List[str]:
        ...


@runtime_checkable
class UserBudgets(Protocol):
    def get_all_budgets(self, context: Context) -> Dict[str, int]:
        ...


@runtime_checkable
class UserPatronMode(Protocol):
    def get_all_patrons_addresses(self, context: Context) -> List[str]:
        ...


class SavedUserRewards(Model):
    allocations: UserAllocations
    user_budgets: UserBudgets
    patrons_mode: UserPatronMode

    def get_unused_rewards(self, context: Context) -> Dict[str, int]:
        budgets = self.user_budgets.get_all_budgets(context)
        donors = self.allocations.get_all_donors_addresses(context)
        patrons = self.patrons_mode.get_all_patrons_addresses(context)

        return get_unused_rewards(budgets, donors, patrons)
