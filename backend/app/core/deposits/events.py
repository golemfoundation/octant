from abc import ABC, abstractmethod
from itertools import groupby
from operator import itemgetter
from typing import Dict, List, Optional

from app.infrastructure.graphql.locks import (
    get_locks_by_timestamp_range,
    get_locks_by_address_and_timestamp_range,
)
from app.infrastructure.graphql.unlocks import (
    get_unlocks_by_timestamp_range,
    get_unlocks_by_address_and_timestamp_range,
)
from app.utils.subgraph_events import create_deposit_event
from app.infrastructure.graphql import get_last_deposit_event


class EventGenerator(ABC):
    def __init__(self, epoch_start: int, epoch_end: int):
        self.epoch_start = epoch_start
        self.epoch_end = epoch_end

    @abstractmethod
    def get_user_events(self, user_address: Optional[str]) -> List[Dict]:
        pass

    @abstractmethod
    def get_all_users_events(self) -> Dict[str, List[Dict]]:
        pass


class SubgraphEventsGenerator(EventGenerator):
    def get_user_events(self, user_address: Optional[str]) -> List[Dict]:
        """
        Get user lock and unlock events from the subgraph within the given timestamp range, sort them by timestamp,

        Returns:
            A list of event dictionaries sorted by timestamp.
        """
        events = []

        event_before_epoch_start = get_last_deposit_event(
            user_address, self.epoch_start
        )
        if event_before_epoch_start is not None:
            event_before_epoch_start["timestamp"] = self.epoch_start
            events = [event_before_epoch_start]

        events.extend(
            get_locks_by_address_and_timestamp_range(
                user_address, self.epoch_start, self.epoch_end
            )
        )
        events.extend(
            get_unlocks_by_address_and_timestamp_range(
                user_address, self.epoch_start, self.epoch_end
            )
        )
        return sorted(events, key=itemgetter("timestamp"))

    def get_all_users_events(self) -> Dict[str, List[Dict]]:
        """
        Get all lock and unlock events from the subgraph within the given timestamp range, sort them by user and timestamp,
        and group them by user.

        Returns:
            A dictionary where keys are user addresses and values are lists of event dictionaries sorted by timestamp.
        """
        events = get_locks_by_timestamp_range(
            self.epoch_start, self.epoch_end
        ) + get_unlocks_by_timestamp_range(self.epoch_start, self.epoch_end)
        sorted_events = sorted(events, key=itemgetter("user", "timestamp"))
        return {k: list(g) for k, g in groupby(sorted_events, key=itemgetter("user"))}


class SimulatedEventsGenerator(EventGenerator):
    def __init__(
        self,
        epoch_start: int,
        epoch_end: int,
        lock_duration: int,
        amount: int,
        epoch_remaining_duration: int,
    ):
        super().__init__(epoch_start, epoch_end)
        self.lock_duration = lock_duration
        self.amount = amount
        self.epoch_remaining_duration = epoch_remaining_duration

    def get_user_events(self, user_address: Optional[str]) -> List[Dict]:
        """
        Retrieve a simulated lock event for a user based on two potential scenarios:

        1. The user maintains their lock for a portion of the epoch.
        2. The user retains their lock for the entire remaining duration of the epoch.
        This could encompass the full duration of the epoch if we're considering a future epoch
        and the user intends to lock for a duration exceeding that epoch.
         Alternatively, it could be just a fraction of the epoch if it's the current epoch and
          the user desires to lock for a longer period.

        Returns:
            A list containing a single lock event.
        """

        if self.lock_duration < self.epoch_remaining_duration:
            return [
                create_deposit_event(
                    amount=self.amount, timestamp=self.epoch_end - self.lock_duration
                ),
            ]
        else:
            return [
                create_deposit_event(
                    amount=self.amount,
                    timestamp=self.epoch_end - self.epoch_remaining_duration,
                ),
            ]

    def get_all_users_events(self) -> Dict[str, List[Dict]]:
        raise NotImplementedError()
