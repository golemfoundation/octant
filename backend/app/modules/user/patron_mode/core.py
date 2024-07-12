from app.context.epoch.details import EpochDetails
from app.modules.common.time import Timestamp
from app.modules.history.dto import PatronDonationItem


def filter_and_reverse_epochs(
    epochs: list[EpochDetails], from_timestamp: Timestamp
) -> list[EpochDetails]:
    filtered_epochs = [
        epoch for epoch in epochs if epoch.finalized_timestamp <= from_timestamp
    ]
    filtered_epochs.reverse()

    return filtered_epochs


def create_patron_donation_item(epoch: EpochDetails, budget: int):
    return PatronDonationItem(
        epoch=epoch.epoch_num, timestamp=epoch.finalized_timestamp, amount=budget
    )
