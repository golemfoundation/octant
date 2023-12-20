from collections import defaultdict
from typing import List, Dict

from app.utils.subgraph_events import create_deposit_event
from app.v2.modules.user.deposits.service.events_generator import EventsGenerator


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

    def update_epoch(self, start: int, end: int):
        self.epoch_start = start
        self.epoch_end = end

    def get_user_events(self, user_address: str = None) -> List[Dict]:
        return self.events[user_address]

    def get_all_users_events(self) -> Dict[str, List[Dict]]:
        return self.events
