from abc import ABC, abstractmethod
from dataclasses import dataclass
from typing import Tuple, List

from app.v2.context.context import EpochContext
from app.v2.engine.user.effective_deposit import UserDeposit
from app.v2.modules.user.deposits.service.calculator import UserDepositsCalculator


@dataclass
class UserDepositsService(ABC):
    user_deposits_calculator: UserDepositsCalculator

    @abstractmethod
    def get_all_effective_deposits(
        self, context: EpochContext
    ) -> Tuple[List[UserDeposit], int]:
        pass

    @abstractmethod
    def get_total_effective_deposit(self, context: EpochContext) -> int:
        pass

    @abstractmethod
    def get_user_effective_deposit(
        self, context: EpochContext, user_address: str
    ) -> int:
        pass

    @abstractmethod
    def estimate_effective_deposit(
        self, context: EpochContext, glm_amount: int, lock_duration_sec: int
    ) -> int:
        pass
