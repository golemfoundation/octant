from _decimal import Decimal
from typing import Tuple, List

from app.core.common import UserDeposit
from app.core.deposits import weighted_average_strategy
from app.core.deposits.events import SimulatedEventsGenerator
from app.core.deposits.weighted_deposits import (
    get_user_weighted_deposits,
)
from app.core.epochs.details import EpochDetails
from app.core.epochs.epochs_registry import EpochsRegistry


def calculate_locked_ratio(total_effective_deposit: int, glm_supply: int) -> Decimal:
    return Decimal(total_effective_deposit) / Decimal(glm_supply)


def get_users_deposits(epoch: int) -> Tuple[List[UserDeposit], int]:
    return weighted_average_strategy.get_user_deposits(epoch)


def get_estimated_total_effective_deposit(epoch: int) -> int:
    _, total = get_users_deposits(epoch)
    return total


def get_estimated_effective_deposit(
    epoch_details: EpochDetails, user_address: str
) -> int:
    return weighted_average_strategy.get_estimated_effective_deposit(
        epoch_details, user_address
    )


def estimate_effective_deposit(
    epoch: EpochDetails, amount: int, lock_duration: int
) -> int:
    epoch_settings = EpochsRegistry.get_epoch_settings(epoch.epoch_no)
    events_generator = SimulatedEventsGenerator(
        epoch.start_sec, epoch.end_sec, lock_duration, amount, epoch.remaining_sec
    )
    deposits_data = get_user_weighted_deposits(
        epoch_settings.user_deposits_weights_calculator, events_generator
    )
    return weighted_average_strategy.calculate_effective_deposit(
        deposits_data.weighted_deposits, deposits_data.epoch_end_locked_amount
    )
