from dataclasses import dataclass
from abc import abstractmethod, ABC


@dataclass
class PPFPayload:
    individual_rewards_equilibrium: int
    all_individual_rewards: int


class PPFCalculator(ABC):
    @abstractmethod
    def calculate_ppf(self, payload: PPFPayload) -> int:
        pass
