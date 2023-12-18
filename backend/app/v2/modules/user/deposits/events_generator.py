from abc import ABC, abstractmethod
from collections import defaultdict
from itertools import groupby
from operator import itemgetter
from typing import Dict, List

from app.infrastructure.graphql import get_last_deposit_event
from app.infrastructure.graphql.locks import (
    get_locks_by_timestamp_range,
    get_locks_by_address_and_timestamp_range,
)
from app.infrastructure.graphql.unlocks import (
    get_unlocks_by_timestamp_range,
    get_unlocks_by_address_and_timestamp_range,
)
from app.utils.subgraph_events import create_deposit_event


class EventsGenerator(ABC):
    def __init__(self, epoch_start: int, epoch_end: int):
        self.epoch_start = epoch_start
        self.epoch_end = epoch_end

    def create_user_events(
        self,
        glm_amount: int,
        lock_duration_sec: int,
        epoch_remaining_duration_sec: int,
        user_address: str = None,
    ):
        raise NotImplementedError()

    def update_epoch(self, start: int, end: int):
        raise NotImplementedError()

    @abstractmethod
    def get_user_events(self, user_address: str = None) -> List[Dict]:
        pass

    @abstractmethod
    def get_all_users_events(self) -> Dict[str, List[Dict]]:
        pass


class SubgraphEventsGenerator(EventsGenerator):
    def get_user_events(self, user_address: str = None) -> List[Dict]:
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


class SimulatedEventsGenerator(EventsGenerator):
    def __init__(
        self,
        epoch_start: int,
        epoch_end: int,
    ):
        super().__init__(epoch_start, epoch_end)
        self.events = defaultdict(lambda: [])

    def create_user_events(
        self,
        glm_amount: int,
        lock_duration_sec: int,
        epoch_remaining_duration_sec: int,
        user_address: str = None,
    ):
        self.events = defaultdict(lambda: [])
        user_events = [
            create_deposit_event(
                amount=glm_amount,
                timestamp=self.epoch_end - epoch_remaining_duration_sec,
            )
        ]
        if lock_duration_sec < epoch_remaining_duration_sec:
            user_events.append(
                create_deposit_event(
                    typename="Unlocked",
                    deposit_before=glm_amount,
                    amount=glm_amount,
                    timestamp=self.epoch_end
                    - epoch_remaining_duration_sec
                    + lock_duration_sec,
                )
            )
        self.events[user_address] = user_events

    def update_user_events(self, start: int, end: int):
        self.epoch_start = start
        self.epoch_end = end

    def get_user_events(self, user_address: str = None) -> List[Dict]:
        return self.events[user_address]

    def get_all_users_events(self) -> Dict[str, List[Dict]]:
        return self.events
