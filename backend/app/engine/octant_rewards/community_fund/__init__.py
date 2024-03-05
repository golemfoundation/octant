from dataclasses import dataclass
from abc import abstractmethod, ABC


@dataclass
class CommunityFundPayload:
    eth_proceeds: int = None


class CommunityFundCalculator(ABC):
    @abstractmethod
    def calculate_ppf(self, payload: CommunityFundPayload) -> int:
        pass
