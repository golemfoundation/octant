from dataclasses import dataclass
from typing import Dict

from app.context.context import Context
from app.modules.user.allocations.service.service import UserAllocationsService
from app.modules.user.budgets.service.service import UserBudgetsService
from app.modules.user.patron_mode.service.service import UserPatronModeService


@dataclass
class SavedUserRewards:
    allocations_service: UserAllocationsService
    budgets_service: UserBudgetsService
    patrons_mode_service: UserPatronModeService

    def get_unused_rewards(self, context: Context) -> Dict[str, int]:
        budgets = self.budgets_service.get_all_budgets(context)
        donors = self.allocations_service.get_all_donors_addresses(context)
        patrons = self.patrons_mode_service.get_all_patrons_addresses(context)

        for donor in donors:
            budgets.pop(donor)
        for patron in patrons:
            budgets.pop(patron)

        return budgets
