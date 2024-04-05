from datetime import datetime
from typing import List, Tuple

from app.context.epoch_state import EpochState
from app.context.helpers import check_if_future
from app.exceptions import InvalidBlocksRange
from app.extensions import epochs
from app.infrastructure import graphql
from app.infrastructure.external_api.etherscan.blocks import get_block_num_from_ts
from app.modules.common.time import from_timestamp_s, sec_to_days


class EpochDetails:
    def __init__(
        self,
        epoch_num: int,
        start,
        duration,
        decision_window,
        remaining_sec=None,
        with_block_range=False,
        current_epoch_simulated=False,
    ):
        now_sec = int(datetime.utcnow().timestamp())
        self.epoch_num = int(epoch_num)
        self.start_sec = int(start)
        if current_epoch_simulated:
            self.duration_sec = now_sec - self.start_sec
        else:
            self.duration_sec = int(duration)
        self.duration_days = sec_to_days(self.duration_sec)
        self.decision_window_sec = int(decision_window)
        self.decision_window_days = sec_to_days(self.decision_window_sec)
        self.end_sec = self.start_sec + self.duration_sec
        self.finalized_sec = self.end_sec + self.decision_window_sec
        self.finalized_timestamp = from_timestamp_s(self.finalized_sec)
        self.start_block, self.end_block = self._calc_blocks_range(
            now_sec, with_block_range, current_epoch_simulated
        )
        if current_epoch_simulated:
            self.remaining_sec = 0
        else:
            self.remaining_sec = (
                self._calc_remaining_sec(now_sec)
                if remaining_sec is None
                else remaining_sec
            )
        self.remaining_days = sec_to_days(self.remaining_sec)

    @property
    def duration_range(self) -> Tuple[int, int]:
        return self.start_sec, self.end_sec

    @property
    def blocks_range(self):
        """
        Returns the number of blocks within [start_block, end_block) in the epoch.
        """
        if not self.end_block or not self.start_block:
            raise InvalidBlocksRange
        return self.end_block - self.start_block

    def _calc_remaining_sec(self, now_sec: int) -> int:
        if now_sec > self.end_sec:
            return 0
        elif self.start_sec <= now_sec < self.end_sec:
            return self.end_sec - now_sec
        return self.duration_sec

    def _calc_blocks_range(
        self,
        now_sec: int,
        with_block_range: bool = False,
        current_epoch_simulated: bool = False,
    ) -> tuple:
        start_block, end_block = None, None

        if with_block_range and not current_epoch_simulated:
            is_start_future = check_if_future(self.start_sec)
            is_end_future = check_if_future(self.end_sec)

            start_block = (
                get_block_num_from_ts(self.start_sec) if not is_start_future else None
            )
            end_block = (
                get_block_num_from_ts(self.end_sec) if not is_end_future else None
            )

        if with_block_range and current_epoch_simulated:
            start_block = get_block_num_from_ts(self.start_sec)
            end_block = get_block_num_from_ts(now_sec)

        return start_block, end_block


def get_epoch_details(
    epoch_num: int,
    epoch_state: EpochState,
    with_block_range: bool = False,
    current_epoch_simulated: bool = False,
) -> EpochDetails:
    if epoch_state == EpochState.FUTURE:
        return get_future_epoch_details(epoch_num)
    return get_epoch_details_by_number(
        epoch_num, with_block_range, current_epoch_simulated
    )


def get_epoch_details_by_number(
    epoch_num: int,
    with_block_range: bool = False,
    current_epoch_simulated: bool = False,
) -> EpochDetails:
    epoch_details = graphql.epochs.get_epoch_by_number(epoch_num)
    return _epoch_details_from_graphql_result(
        epoch_details, with_block_range, current_epoch_simulated
    )


def get_epochs_details(
    from_epoch: int,
    to_epoch: int,
    with_block_range=False,
    current_epoch_simulated: bool = False,
) -> List[EpochDetails]:
    epochs_details = graphql.epochs.get_epochs_by_range(from_epoch, to_epoch)

    return [
        _epoch_details_from_graphql_result(
            epoch_details, with_block_range, current_epoch_simulated
        )
        for epoch_details in epochs_details
    ]


def get_future_epoch_details(epoch_num: int) -> EpochDetails:
    epoch_details = epochs.get_future_epoch_props()
    return EpochDetails(
        epoch_num=epoch_num,
        start=epoch_details[2],
        duration=epoch_details[3],
        decision_window=epoch_details[4],
        remaining_sec=epoch_details[3],
    )


def _epoch_details_from_graphql_result(
    epoch_details: dict,
    with_block_range: bool = False,
    current_epoch_simulated: bool = False,
) -> EpochDetails:
    return EpochDetails(
        epoch_num=epoch_details["epoch"],
        start=epoch_details["fromTs"],
        duration=epoch_details["duration"],
        decision_window=epoch_details["decisionWindow"],
        with_block_range=with_block_range,
        current_epoch_simulated=current_epoch_simulated,
    )
