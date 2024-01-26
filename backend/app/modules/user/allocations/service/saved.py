from dataclasses import dataclass
from typing import List

from app.context.manager import Context
from app.infrastructure import database
from app.modules.dto import AccountFundsDTO


@dataclass
class SavedUserAllocations:
    def get_all_donors_addresses(self, context: Context) -> List[str]:
        return database.allocations.get_users_with_allocations(
            context.epoch_details.epoch_num
        )

    def get_all_users_with_allocations_sum(
        self, context: Context
    ) -> List[AccountFundsDTO]:
        return database.allocations.get_alloc_sum_by_epoch_and_user_address(
            context.epoch_details.epoch_num
        )
