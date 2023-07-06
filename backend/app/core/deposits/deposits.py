from _decimal import Decimal
from typing import Tuple, List

from app.core.common import UserDeposit
from app.core.deposits import weighted_average_strategy, min_value_strategy


def calculate_locked_ratio(total_effective_deposit: int, glm_supply: int) -> Decimal:
    return Decimal(total_effective_deposit) / Decimal(glm_supply)


def get_user_deposits(epoch: int) -> Tuple[List[UserDeposit], int]:
    if epoch == 1:
        return weighted_average_strategy.get_user_deposits(
            epoch
        )  # only applicable for epoch 1
    else:
        return min_value_strategy.get_user_deposits(epoch)
