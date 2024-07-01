from abc import ABC, abstractmethod
from dataclasses import dataclass
from decimal import Decimal


@dataclass
class MatchedRewardsPayload:
    total_rewards: int = None
    vanilla_individual_rewards: int = None
    patrons_rewards: int = None
    staking_proceeds: int = None
    ire_percent: Decimal = None
    tr_percent: Decimal = None
    locked_ratio: Decimal = None


@dataclass
class MatchedRewards(ABC):
    @abstractmethod
    def calculate_matched_rewards(self, payload: MatchedRewardsPayload) -> int:
        pass
