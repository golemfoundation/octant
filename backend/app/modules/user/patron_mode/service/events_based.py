from typing import List

from app.context import epoch_details
from app.context.manager import Context
from app.infrastructure import database
from app.modules.common.time import Timestamp
from app.modules.dto import PatronDonationItem
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

    def get_patron_donations(
        self, context: Context, user_address: str, from_timestamp: Timestamp, limit: int
    ) -> list[PatronDonationItem]:
        last_finalized_snapshot = context.snapshots_state.last_finalized_snapshot_num

        epochs = epoch_details.get_epochs_details(
            last_finalized_snapshot - limit, last_finalized_snapshot
        )
        epochs.reverse()

        events = []

        for epoch in epochs:
            epoch_finalization_timestamp = epoch.finalized_timestamp
            if epoch_finalization_timestamp <= from_timestamp:
                patrons_at_epoch = database.patrons.get_all_patrons_at_timestamp(
                    epoch_finalization_timestamp.datetime()
                )
                if user_address in patrons_at_epoch:
                    user_budget = database.budgets.get_by_user_address_and_epoch(
                        user_address, epoch.epoch_num
                    )

                    if user_budget and user_budget.budget:
                        events.append(
                            PatronDonationItem(
                                epoch=epoch.epoch_num,
                                timestamp=epoch_finalization_timestamp,
                                amount=int(user_budget.budget),
                            )
                        )

        return events
