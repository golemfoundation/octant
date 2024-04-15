from dataclasses import dataclass
from abc import abstractmethod, ABC


@dataclass
class PPFPayload:
    eth_proceeds: int = None


class PPFCalculator(ABC):
    @abstractmethod
    def calculate_ppf(self, payload: PPFPayload) -> int:
        pass
