from abc import ABC, abstractmethod
from dataclasses import dataclass
from decimal import Decimal


@dataclass
class TotalAndAllIndividualPayload:
    eth_proceeds: int = None
    locked_ratio: Decimal = None
    operational_cost: int = None


@dataclass
class TotalAndAllIndividualRewards(ABC):
    IRE_PERCENT: Decimal = None
    TR_PERCENT: Decimal = None

    @abstractmethod
    def calculate_total_rewards(self, payload: TotalAndAllIndividualPayload) -> int:
        pass

    @abstractmethod
    def calculate_vanilla_individual_rewards(
        self, payload: TotalAndAllIndividualPayload
    ) -> int:
        pass

    def calculate_individual_rewards_equilibrium(
        self, payload: TotalAndAllIndividualPayload
    ):
        return None
