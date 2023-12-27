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
from app.v2.context.context import Context


class SubgraphEventsGenerator:
    def get_user_events(self, context: Context, user_address: str = None) -> List[Dict]:
        """
        Get user lock and unlock events from the subgraph within the given timestamp range, sort them by timestamp,

        Returns:
            A list of event dictionaries sorted by timestamp.
        """

        start = context.epoch_details.start_sec
        end = context.epoch_details.end_sec
        events = []

        event_before_epoch_start = get_last_deposit_event(user_address, start)
        if event_before_epoch_start is not None:
            event_before_epoch_start["timestamp"] = start
            events = [event_before_epoch_start]

        events.extend(
            get_locks_by_address_and_timestamp_range(user_address, start, end)
        )
        events.extend(
            get_unlocks_by_address_and_timestamp_range(user_address, start, end)
        )
        return sorted(events, key=itemgetter("timestamp"))

    def get_all_users_events(self, context: Context) -> Dict[str, List[Dict]]:
        """
        Get all lock and unlock events from the subgraph within the given timestamp range, sort them by user and timestamp,
        and group them by user.

        Returns:
            A dictionary where keys are user addresses and values are lists of event dictionaries sorted by timestamp.
        """
        start = context.epoch_details.start_sec
        end = context.epoch_details.end_sec
        events = get_locks_by_timestamp_range(
            start, end
        ) + get_unlocks_by_timestamp_range(start, end)
        sorted_events = sorted(events, key=itemgetter("user", "timestamp"))
        return {k: list(g) for k, g in groupby(sorted_events, key=itemgetter("user"))}
