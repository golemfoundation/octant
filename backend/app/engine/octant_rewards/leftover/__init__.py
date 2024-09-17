from abc import ABC, abstractmethod
from dataclasses import dataclass


@dataclass
class LeftoverPayload:
    staking_proceeds: int = None
    operational_cost: int = None
    community_fund: int = None
    ppf: int = None
    total_withdrawals: int = None
    total_matched_rewards: int = None
    used_matched_rewards: int = None


@dataclass
class Leftover(ABC):
    @abstractmethod
    def calculate_leftover(self, payload: LeftoverPayload) -> int:
        pass

    def extract_unused_matched_rewards(self, *args, **kwargs) -> int:
        return 0
