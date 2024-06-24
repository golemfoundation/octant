from abc import ABC, abstractmethod
from dataclasses import dataclass


@dataclass
class LeftoverPayload:
    staking_proceeds: int = None
    operational_cost: int = None
    community_fund: int = None
    ppf: int = None
    total_withdrawals: int = None


@dataclass
class Leftover(ABC):
    @abstractmethod
    def calculate_leftover(self, payload: LeftoverPayload) -> int:
        pass
