from abc import ABC, abstractmethod
from dataclasses import dataclass


@dataclass
class OperationalCostPayload:
    eth_proceeds: int = None


@dataclass
class OperationalCost(ABC):
    @abstractmethod
    def calculate_operational_cost(self, payload: OperationalCostPayload) -> int:
        pass
