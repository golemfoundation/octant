from _decimal import Decimal
from typing import Tuple, List

from app.core.common import UserDeposit
from app.core.deposits import weighted_average_strategy, min_value_strategy
from app.core.deposits.weighted_deposits import WeightedDeposit


def calculate_locked_ratio(total_effective_deposit: int, glm_supply: int) -> Decimal:
    return Decimal(total_effective_deposit) / Decimal(glm_supply)


def get_users_deposits(epoch: int) -> Tuple[List[UserDeposit], int]:
    if epoch == 1:
        return weighted_average_strategy.get_user_deposits(
            epoch
        )  # only applicable for epoch 1
    else:
        return min_value_strategy.get_user_deposits(epoch)


def get_estimated_effective_deposit(start: int, end: int, user_address: str) -> int:
    return weighted_average_strategy.get_estimated_effective_deposit(
        start, end, user_address
    )


def estimate_effective_deposit(deposits: List[WeightedDeposit]) -> int:
    return weighted_average_strategy.calculate_effective_deposit(deposits)
