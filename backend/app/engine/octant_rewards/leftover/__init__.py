from abc import ABC, abstractmethod
from dataclasses import dataclass


@dataclass
class LeftoverPayload:
    staking_proceeds: int = 0
    operational_cost: int = 0
    community_fund: int = 0
    ppf: int = 0
    total_withdrawals: int = 0
    total_matched_rewards: int = 0
    used_matched_rewards: int = 0


@dataclass
class Leftover(ABC):
    @abstractmethod
    def calculate_leftover(self, payload: LeftoverPayload) -> int:
        pass
