from dataclasses import dataclass
from typing import List

from app.context.manager import Context
from app.infrastructure import database


@dataclass
class SavedUserAllocations:
    def get_all_donors_addresses(self, context: Context) -> List[str]:
        return database.allocations.get_users_with_allocations(
            context.epoch_details.epoch_num
        )
