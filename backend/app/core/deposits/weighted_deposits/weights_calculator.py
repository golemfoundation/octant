from abc import ABC, abstractclassmethod
from typing import List, Dict

from app.core.deposits.events import EventGenerator
from app.core.deposits.weighted_deposits.weighted_deposit import WeightedDeposit


class WeightsCalculator(ABC):
    @abstractclassmethod
    def compute_all_users_weigted_deposits(
        cls, events_generator: EventGenerator
    ) -> Dict[str, List[WeightedDeposit]]:
        pass

    @abstractclassmethod
    def compute_user_weighted_deposits(
        cls, events_generator: EventGenerator, user_address: str = None
    ) -> List[WeightedDeposit]:
        pass
