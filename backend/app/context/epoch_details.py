from datetime import datetime
from typing import List

from app.context.epoch_state import EpochState
from app.extensions import epochs
from app.infrastructure import graphql
from app.legacy.utils.time import sec_to_days, from_timestamp_s


class EpochDetails:
    def __init__(
        self, epoch_num: int, start, duration, decision_window, remaining_sec=None
    ):
        self.epoch_num = int(epoch_num)
        self.duration_sec = int(duration)
        self.duration_days = sec_to_days(self.duration_sec)
        self.decision_window_sec = int(decision_window)
        self.decision_window_days = sec_to_days(self.decision_window_sec)
        self.start_sec = int(start)
        self.end_sec = self.start_sec + self.duration_sec
        self.finalized_sec = self.end_sec + self.decision_window_sec
        self.finalized_timestamp = from_timestamp_s(self.finalized_sec)

        if remaining_sec is None:
            now_sec = int(datetime.utcnow().timestamp())
            if now_sec > self.end_sec:
                self.remaining_sec = 0
            elif self.start_sec <= now_sec < self.end_sec:
                self.remaining_sec = self.end_sec - now_sec
            else:
                self.remaining_sec = self.duration_sec
        else:
            self.remaining_sec = remaining_sec

        self.remaining_days = sec_to_days(self.remaining_sec)


def get_epoch_details(epoch_num: int, epoch_state: EpochState) -> EpochDetails:
    if epoch_state == EpochState.FUTURE:
        return get_future_epoch_details(epoch_num)
    else:
        return get_epoch_details_by_number(epoch_num)


def get_epoch_details_by_number(epoch_num: int) -> EpochDetails:
    epoch_details = graphql.epochs.get_epoch_by_number(epoch_num)
    return _epoch_details_from_graphql_result(epoch_details)


def get_epochs_details(from_epoch: int, to_epoch: int) -> List[EpochDetails]:
    epochs_details = graphql.epochs.get_epochs_by_range(from_epoch, to_epoch)

    return [
        _epoch_details_from_graphql_result(epoch_details)
        for epoch_details in epochs_details
    ]


def get_future_epoch_details(epoch_num: int) -> EpochDetails:
    epoch_details = epochs.get_future_epoch_props()

    return EpochDetails(
        epoch_num=epoch_num,
        # TODO contract returns start value for the next epoch. If we need this value for any other epoch in the future we have to calculate it
        start=epoch_details[2],
        duration=epoch_details[3],
        decision_window=epoch_details[4],
        remaining_sec=epoch_details[3],
    )


def _epoch_details_from_graphql_result(result) -> EpochDetails:
    return EpochDetails(
        epoch_num=result["epoch"],
        start=result["fromTs"],
        duration=result["duration"],
        decision_window=result["decisionWindow"],
    )
