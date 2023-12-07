from abc import ABC, abstractmethod
from dataclasses import dataclass


@dataclass
class CutOffPayload:
    locked_amount: int = None
    effective_amount: int = None


@dataclass
class CutOff(ABC):
    @abstractmethod
    def apply_cutoff(self, payload: CutOffPayload) -> int:
        pass
