from collections import defaultdict
from operator import attrgetter
from typing import List, Dict

from app.engine.user.effective_deposit import DepositEvent
from tests.helpers.subgraph.events import (
    create_deposit_events,
    EventDetailsWithSource,
    EventDetails,
)


class MockEventGenerator:
    def __init__(self, user_events: Dict[str, List[DepositEvent]]):
        self.events = {
            user: sorted(
                map(DepositEvent.from_dict, events), key=attrgetter("timestamp")
            )
            for user, events in user_events.items()
        }

    def get_user_events(self, user_address: str) -> List[DepositEvent]:
        return self.events.get(user_address, [])

    def get_all_users_events(self) -> Dict[str, List[DepositEvent]]:
        return self.events


class MockEventGeneratorFactory:
    def build(
        self,
        events: Dict[str, List[EventDetails | EventDetailsWithSource]],
    ) -> MockEventGenerator:
        events_by_user = defaultdict(list)
        for event in create_deposit_events(events):
            events_by_user[event["user"]].append(event)

        return MockEventGenerator(events_by_user)
