from dataclasses import dataclass
from abc import abstractmethod, ABC
from decimal import Decimal


@dataclass
class PPFPayload:
    individual_rewards_equilibrium: int
    vanilla_individual_rewards: int
    locked_ratio: Decimal
    ire_percent: Decimal


class PPFCalculator(ABC):
    @abstractmethod
    def calculate_ppf(self, payload: PPFPayload) -> int:
        pass
