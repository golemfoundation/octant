from itertools import groupby
from operator import itemgetter
from typing import List, Dict

from app.infrastructure.graphql import get_last_deposit_event
from app.infrastructure.graphql.locks import (
    get_locks_by_address_and_timestamp_range,
    get_locks_by_timestamp_range,
)
from app.infrastructure.graphql.unlocks import (
    get_unlocks_by_address_and_timestamp_range,
    get_unlocks_by_timestamp_range,
)
from app.v2.modules.user.deposits.service.events_generator import EventsGenerator


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
