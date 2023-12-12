from abc import ABC, abstractmethod
from dataclasses import dataclass
from typing import Tuple, List, Dict

from dataclass_wizard import JSONWizard


@dataclass(frozen=True)
class UserDeposit(JSONWizard):
    user_address: str
    effective_deposit: int
    deposit: int


@dataclass
class UserEffectiveDepositPayload:
    epoch_start: int = None
    epoch_end: int = None
    lock_events_by_addr: Dict[str, List[Dict]] = None


@dataclass
class UserEffectiveDeposit(ABC):
    @abstractmethod
    def calculate_users_effective_deposits(
        self, payload: UserEffectiveDepositPayload
    ) -> Tuple[List[UserDeposit], int]:
        pass
