from typing import Tuple

from app.exceptions import InvalidBlocksRange
from app.modules.common.time import from_timestamp_s, sec_to_days


class EpochDetails:
    def __init__(
        self,
        epoch_num: int,
        start: int | str,
        duration: int | str,
        decision_window: int | str,
        remaining_sec: int | str,
        start_block: int = None,
        end_block: int = None,
    ):
        self.epoch_num = epoch_num
        self.start_sec = int(start)
        self.duration_sec = int(duration)
        self.duration_days = sec_to_days(self.duration_sec)
        self.decision_window_sec = int(decision_window)
        self.decision_window_days = sec_to_days(self.decision_window_sec)
        self.end_sec = self.start_sec + self.duration_sec
        self.finalized_sec = self.end_sec + self.decision_window_sec
        self.finalized_timestamp = from_timestamp_s(self.finalized_sec)
        self.remaining_sec = int(remaining_sec)
        self.remaining_days = sec_to_days(self.remaining_sec)
        self.start_block = start_block
        self.end_block = end_block

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
