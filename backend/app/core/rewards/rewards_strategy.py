from decimal import Decimal
from abc import ABC, abstractmethod


class RewardsStrategy(ABC):
    @abstractmethod
    def calculate_total_rewards(self, eth_proceeds: int, locked_ratio: Decimal) -> int:
        pass

    @abstractmethod
    def calculate_all_individual_rewards(
        self, eth_proceeds: int, locked_ratio: Decimal
    ) -> int:
        pass
