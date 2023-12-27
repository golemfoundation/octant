from itertools import accumulate
from typing import List, Dict, Tuple


class MockEventGenerator:
    def __init__(self, user_events: Dict[str, List[Dict]]):
        self.events = {
            user: sorted(events, key=lambda x: x["timestamp"])
            for user, events in user_events.items()
        }

    def get_user_events(self, user_address: str = None) -> List[Dict]:
        return self.events[user_address]

    def get_all_users_events(self) -> Dict[str, List[Dict]]:
        return self.events


class MockEventGeneratorFactory:
    def build(
        self,
        events: Dict[str, List[Tuple[int, int]]],
    ) -> MockEventGenerator:
        events = {
            user_address: self._map_user_events(user_events)
            for user_address, user_events in events.items()
        }

        return MockEventGenerator(events)

    @staticmethod
    def _tuple_to_event_dict(
        event_and_deposit_before: Tuple[Tuple[int, int], int]
    ) -> Dict:
        user_event, deposit_before = event_and_deposit_before
        return {
            "timestamp": user_event[0],
            "amount": abs(user_event[1]),
            "__typename": "Locked" if user_event[1] > 0 else "Unlocked",
            "depositBefore": deposit_before,
        }

    @staticmethod
    def _map_user_events(user_events: List[Tuple[int, int]]) -> List[Dict]:
        user_events.sort(key=lambda event: event[0])  # sort by timestamp, for sanity
        events_and_deposits = zip(
            user_events, accumulate(map(lambda event: event[1], user_events), initial=0)
        )
        return list(
            map(MockEventGeneratorFactory._tuple_to_event_dict, events_and_deposits)
        )
