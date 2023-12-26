from abc import ABC, abstractmethod
from copy import deepcopy
from dataclasses import dataclass
from enum import StrEnum
from itertools import groupby
from operator import attrgetter
from typing import Dict, List, Optional

from eth_utils import to_checksum_address

from app.core.epochs.details import EpochDetails
from app.infrastructure.graphql.locks import (
    get_locks_by_timestamp_range,
    get_locks_by_address_and_timestamp_range,
)
from app.infrastructure.graphql.unlocks import (
    get_unlocks_by_timestamp_range,
    get_unlocks_by_address_and_timestamp_range,
)
from app.infrastructure.graphql import get_last_deposit_event


class EventType(StrEnum):
    LOCK = "Locked"
    UNLOCK = "Unlocked"


@dataclass(frozen=True)
class DepositEvent:
    user: Optional[str]
    type: EventType
    timestamp: int
    amount: int
    deposit_before: int

    @staticmethod
    def from_dict(dict: Dict):
        type = EventType(dict["__typename"])
        user = to_checksum_address(dict["user"]) if dict["user"] is not None else None
        timestamp = int(dict["timestamp"])
        amount = int(dict["amount"])
        deposit_before = int(dict["depositBefore"])

        return DepositEvent(
            user=user,
            type=type,
            timestamp=timestamp,
            amount=amount,
            deposit_before=deposit_before,
        )


class EventGenerator(ABC):
    def __init__(self, epoch_start: int, epoch_end: int):
        self.epoch_start = epoch_start
        self.epoch_end = epoch_end

    @abstractmethod
    def get_user_events(self, user_address: Optional[str]) -> List[DepositEvent]:
        pass

    @abstractmethod
    def get_all_users_events(self) -> Dict[str, List[DepositEvent]]:
        pass


class EpochEventsGenerator(EventGenerator):
    def __init__(self, epoch_details: EpochDetails):
        super().__init__(epoch_details.start_sec, epoch_details.end_sec)
        self._epoch_no = epoch_details.epoch_no
        self._user_events_cache = None

    def get_user_events(self, user_address: Optional[str]) -> List[DepositEvent]:
        """
        Get user lock and unlock events from the subgraph within the given timestamp range, sort them by timestamp,

        Returns:
            A list of event dictionaries sorted by timestamp.
        """

        user_address = to_checksum_address(user_address)

        if self._user_events_cache is not None:
            if user_address in self._user_events_cache:
                return deepcopy(self._user_events_cache[user_address])
            else:
                return []

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

        events = list(map(DepositEvent.from_dict, events))

        return sorted(events, key=attrgetter("timestamp"))

    def get_all_users_events(self) -> Dict[str, List[DepositEvent]]:
        """
        Get all lock and unlock events from the subgraph within the given timestamp range, sort them by user and timestamp,
        and group them by user.

        Returns:
            A dictionary where keys are user addresses and values are lists of event dictionaries sorted by timestamp.
        """
        events = get_locks_by_timestamp_range(
            self.epoch_start, self.epoch_end
        ) + get_unlocks_by_timestamp_range(self.epoch_start, self.epoch_end)

        events = list(map(DepositEvent.from_dict, events))
        sorted_events = sorted(events, key=attrgetter("user", "timestamp"))

        self._user_events_cache = {
            k: list(g) for k, g in groupby(sorted_events, key=attrgetter("user"))
        }

        return deepcopy(self._user_events_cache)


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

    def get_user_events(self, user_address: Optional[str]) -> List[DepositEvent]:
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
                DepositEvent(
                    user=user_address,
                    type=EventType.LOCK,
                    timestamp=self.epoch_end - self.lock_duration,
                    amount=self.amount,
                    deposit_before=0,
                )
            ]
        else:
            return [
                DepositEvent(
                    user=user_address,
                    type=EventType.LOCK,
                    timestamp=self.epoch_end - self.epoch_remaining_duration,
                    amount=self.amount,
                    deposit_before=0,
                )
            ]

    def get_all_users_events(self) -> Dict[str, List[DepositEvent]]:
        raise NotImplementedError()
