from typing import List

from app.context.manager import Context
from app.infrastructure import database
from app.pydantic import Model


class EventsBasedUserPatronMode(Model):
    def get_all_patrons_addresses(
        self, context: Context, with_budget=True
    ) -> List[str]:
        ts = context.epoch_details.finalized_timestamp
        patrons = database.patrons.get_all_patrons_at_timestamp(ts.datetime())

        if with_budget:
            budgets = database.budgets.get_all_by_epoch(context.epoch_details.epoch_num)
            patrons = [patron for patron in patrons if patron in budgets.keys()]

        return patrons

    def get_patrons_rewards(self, context: Context) -> int:
        epoch_details = context.epoch_details
        patrons = database.patrons.get_all_patrons_at_timestamp(
            epoch_details.finalized_timestamp.datetime()
        )
        return database.budgets.get_sum_by_users_addresses_and_epoch(
            patrons, epoch_details.epoch_num
        )
