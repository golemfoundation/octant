from typing import List, Protocol, Dict, runtime_checkable

from app.context.manager import Context
from app.modules.dto import AccountFundsDTO
from app.modules.user.rewards.core import get_unused_rewards
from app.pydantic import Model


@runtime_checkable
class UserAllocations(Protocol):
    def get_all_donors_addresses(self, context: Context) -> List[str]:
        ...

    def get_all_users_with_allocations_sum(
        self, context: Context
    ) -> List[AccountFundsDTO]:
        ...

    def get_user_allocation_sum(self, context: Context, user_address: str) -> int:
        ...

    def has_user_allocated_rewards(self, context: Context, user_address: str) -> bool:
        ...


@runtime_checkable
class UserBudgets(Protocol):
    def get_all_budgets(self, context: Context) -> Dict[str, int]:
        ...

    def get_budget(self, context: Context, user_address: str) -> int:
        ...


@runtime_checkable
class UserPatronMode(Protocol):
    def get_all_patrons_addresses(self, context: Context) -> List[str]:
        ...


class CalculatedUserRewards(Model):
    allocations: UserAllocations
    user_budgets: UserBudgets
    patrons_mode: UserPatronMode

    def get_unused_rewards(self, context: Context) -> Dict[str, int]:
        budgets = self.user_budgets.get_all_budgets(context)
        donors = self.allocations.get_all_donors_addresses(context)
        patrons = self.patrons_mode.get_all_patrons_addresses(context)

        return get_unused_rewards(budgets, donors, patrons)

    def get_claimed_rewards(self, context: Context) -> (List[AccountFundsDTO], int):
        budgets = self.user_budgets.get_all_budgets(context)
        rewards_sum = 0
        rewards = []

        for address, amount in self.allocations.get_all_users_with_allocations_sum(
            context
        ):
            user_budget = budgets.get(address)
            claimed_rewards = user_budget - amount
            if claimed_rewards > 0:
                rewards.append(AccountFundsDTO(address, claimed_rewards))
                rewards_sum += claimed_rewards

        return rewards, rewards_sum

    def get_user_claimed_rewards(self, context: Context, user_address: str) -> int:
        if not self.allocations.has_user_allocated_rewards(context, user_address):
            return 0

        budget = self.user_budgets.get_budget(context, user_address)
        allocation = self.allocations.get_user_allocation_sum(context, user_address)

        return budget - allocation
