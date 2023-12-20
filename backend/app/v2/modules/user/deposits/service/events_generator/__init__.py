from abc import ABC, abstractmethod
from typing import List, Dict


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
