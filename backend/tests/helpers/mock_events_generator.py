from typing import List, Dict, Optional, Tuple
from collections import defaultdict

from app.core.deposits.events import EventGenerator

from tests.helpers import create_deposit_events
from tests.conftest import UserAccount


class MockEventGenerator(EventGenerator):
    def __init__(
        self, epoch_start: int, epoch_end: int, user_events: Dict[str, List[Dict]]
    ):
        super().__init__(epoch_start, epoch_end)

        self.events = {
            user: sorted(events, key=lambda x: x["timestamp"])
            for user, events in user_events.items()
        }

    def get_user_events(self, user_address: Optional[str]) -> List[Dict]:
        return self.events[user_address] if user_address in self.events else []

    def get_all_users_events(self) -> Dict[str, List[Dict]]:
        return self.events


class MockEventGeneratorFactory:
    def __init__(self, epoch_start: int, epoch_end: int):
        self.epoch_start = epoch_start
        self.epoch_end = epoch_end

    def build(
        self,
        events: Dict[UserAccount, List[Tuple[int, int]]],
        epoch_start: Optional[int] = None,
        epoch_end: Optional[int] = None,
    ) -> MockEventGenerator:
        epoch_start = epoch_start if epoch_start is not None else self.epoch_start
        epoch_end = epoch_end if epoch_end is not None else self.epoch_end

        events_by_user = defaultdict(list)
        for event in create_deposit_events(events):
            events_by_user[event["user"]].append(event)

        return MockEventGenerator(epoch_start, epoch_end, events_by_user)
