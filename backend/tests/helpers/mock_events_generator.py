from typing import List, Dict, Optional, Tuple
from itertools import accumulate

from app.core.deposits.events import EventGenerator


class MockEventGenerator(EventGenerator):
    def __init__(
        self, epoch_start: int, epoch_end: int, user_events: List[Dict[str, Dict]]
    ):
        super().__init__(epoch_start, epoch_end)
        self.epoch_start = epoch_start
        self.epoch_end = epoch_end

        self.events = user_events

        self.events = {
            user: sorted(events, key=lambda x: x["timestamp"])
            for user, events in user_events.items()
        }

    def get_user_events(self, user_address: Optional[str]) -> List[Dict]:
        return self.events[user_address]

    def get_all_users_events(self) -> Dict[str, List[Dict]]:
        return self.events


def event_generator_builder(epoch_start: int, epoch_end: int):
    def create_event_generator(
        events: Dict[str, List[Tuple[int, int]]],
        epoch_start=epoch_start,
        epoch_end=epoch_end,
    ) -> EventGenerator:
        def tuple_to_event_dict(t):
            ue, deposit_before = t
            return {
                "timestamp": ue[0],
                "amount": abs(ue[1]),
                "__typename": "Locked" if ue[1] > 0 else "Unlocked",
                "depositBefore": deposit_before,
            }

        def map_user_events(user_events: List[Tuple[int, int]]):
            user_events.sort(key=lambda ue: ue[0])  # sort by timestamp, for sanity
            events_and_deposits = zip(
                user_events, accumulate(map(lambda ue: ue[1], user_events), initial=0)
            )
            return list(map(tuple_to_event_dict, events_and_deposits))

        events = {
            user.address: map_user_events(user_events)
            for user, user_events in events.items()
        }

        return MockEventGenerator(epoch_start, epoch_end, events)

    return create_event_generator
