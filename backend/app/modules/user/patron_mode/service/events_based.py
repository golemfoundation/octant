from typing import List

from app.context.epoch.details import EpochDetails
from app.context.epoch.factory import get_epochs_details
from app.context.manager import Context
from app.infrastructure import database
from app.modules.common.time import Timestamp
from app.modules.history.dto import PatronDonationItem
from app.modules.user.patron_mode.core import (
    filter_and_reverse_epochs,
    create_patron_donation_item,
)
from app.pydantic import Model


class EventsBasedUserPatronMode(Model):
    def get_all_patrons_addresses(
        self, context: Context, with_budget=True
    ) -> List[str]:
        patrons = self._get_patron_budgets(context.epoch_details, with_budget)
        return list(patrons.keys())

    def get_patrons_rewards(self, context: Context) -> int:
        epoch = context.epoch_details
        patrons = database.patrons.get_all_patrons_at_timestamp(
            epoch.finalized_timestamp.datetime()
        )
        return database.budgets.get_sum_by_users_addresses_and_epoch(
            patrons, epoch.epoch_num
        )

    def get_patron_donations(
        self, context: Context, user_address: str, from_timestamp: Timestamp, limit: int
    ) -> list[PatronDonationItem]:
        last_finalized_snapshot = context.snapshots_state.last_finalized_snapshot_num

        epochs = get_epochs_details(
            last_finalized_snapshot - limit + 1, last_finalized_snapshot + 1
        )
        epochs = filter_and_reverse_epochs(epochs, from_timestamp)
        patron_donations = []

        for epoch in epochs:
            patrons = self._get_patron_budgets(epoch)
            if user_address in patrons:
                patron_donations.append(
                    create_patron_donation_item(epoch, patrons[user_address])
                )

        return patron_donations

    def _get_patron_budgets(
        self, epoch: EpochDetails, with_budget=True
    ) -> dict[str, int]:
        ts = epoch.finalized_timestamp
        patrons = database.patrons.get_all_patrons_at_timestamp(ts.datetime())

        if with_budget:
            all_budgets = database.budgets.get_all_by_epoch(epoch.epoch_num)
            return {
                patron: all_budgets[patron]
                for patron in patrons
                if patron in all_budgets.keys()
            }
        else:
            return {patron: 0 for patron in patrons}
