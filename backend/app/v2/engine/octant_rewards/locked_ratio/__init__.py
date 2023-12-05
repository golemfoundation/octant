from abc import ABC, abstractmethod
from dataclasses import dataclass
from decimal import Decimal


@dataclass
class LockedRatioPayload:
    total_effective_deposit: int = None


class LockedRatio(ABC):
    @abstractmethod
    def calculate_locked_ratio(self, payload: LockedRatioPayload) -> Decimal:
        pass
