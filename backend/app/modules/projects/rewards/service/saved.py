from typing import Optional

from app.context.manager import Context
from app.infrastructure import database
from app.pydantic import Model


class SavedProjectRewards(Model):
    def get_allocation_threshold(self, context: Context) -> Optional[int]:
        epoch_num = context.epoch_details.epoch_num
        total_allocated = database.allocations.get_alloc_sum_by_epoch(epoch_num)

        return context.epoch_settings.project.rewards.calculate_threshold(
            total_allocated, context.projects_details.projects
        )
