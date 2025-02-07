from pydantic import TypeAdapter
from app import exceptions
from app.context.epoch.details import EpochDetails
from v2.epochs.subgraphs import EpochSubgraphItem
from tests.v2.fake_subgraphs.helpers import FakeEpochEventDetails
from v2.core.exceptions import EpochsNotFound


class FakeEpochsSubgraph:
    def __init__(self, epochs_events: list[FakeEpochEventDetails] | None = None):
        if epochs_events is None:
            epochs_events = []

        self.epochs_events = map(
            lambda epoch_event: epoch_event.to_dict(), epochs_events
        )

    async def fetch_epoch_by_number(self, epoch_number: int) -> EpochSubgraphItem:
        """
        Simulate fetching epoch details by epoch number.
        """
        matching_epochs = [
            epoch for epoch in self.epochs_events if epoch["epoch"] == epoch_number
        ]

        if not matching_epochs:
            raise exceptions.EpochNotIndexed(epoch_number)

        return TypeAdapter(EpochSubgraphItem).validate_python(matching_epochs[0])

    async def get_epoch_by_number(self, epoch_number: int) -> EpochDetails:
        """
        Simulate fetching epoch details by epoch number.
        """
        matching_epochs = [
            epoch for epoch in self.epochs_events if epoch["epoch"] == epoch_number
        ]

        if not matching_epochs:
            raise exceptions.EpochNotIndexed(epoch_number)

        epoch_details = matching_epochs[0]
        return EpochDetails(
            epoch_num=epoch_details["epoch"],
            start=epoch_details["fromTs"],
            duration=epoch_details["duration"],
            decision_window=epoch_details["decisionWindow"],
            remaining_sec=0,
        )

    async def get_latest_epoch(self) -> EpochDetails:
        """
        Simulate fetching the latest epoch.
        """
        if not self.epochs_events:
            raise EpochsNotFound()

        latest_epoch = max(self.epochs_events, key=lambda e: e["epoch"])
        return EpochDetails(
            epoch_num=latest_epoch["epoch"],
            start=latest_epoch["fromTs"],
            duration=latest_epoch["duration"],
            decision_window=latest_epoch["decisionWindow"],
            remaining_sec=0,
        )
