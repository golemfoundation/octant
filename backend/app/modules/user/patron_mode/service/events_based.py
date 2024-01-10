from dataclasses import dataclass
from typing import List

from app.context.manager import Context
from app.infrastructure import database


@dataclass
class EventsBasedUserPatronMode:
    def get_all_patrons_addresses(
        self, context: Context, with_budget=True
    ) -> List[str]:
        ts = context.epoch_details.finalized_timestamp
        patrons = database.patrons.get_all_patrons_at_timestamp(ts.datetime())

        if with_budget:
            budgets = database.budgets.get_all_by_epoch(context.epoch_details.epoch_num)
            patrons = [patron for patron in patrons if patron in budgets.keys()]

        return patrons
