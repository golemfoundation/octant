from typing import List, Tuple
from decimal import Decimal

from app.core.common import UserDeposit

from app.core.epochs.epochs_registry import EpochsRegistry
from app.core.epochs.details import EpochDetails
from app.core.deposits.cut_off import apply_weighted_average_cutoff
from app.core.deposits.events import EpochEventsGenerator
from app.core.deposits.weighted_deposits import (
    get_all_users_weighted_deposits,
    get_user_weighted_deposits,
    WeightedDeposit,
)


def get_user_deposits(epoch_no: int) -> Tuple[List[UserDeposit], int]:
    """
    Get the user deposits for a given epoch number as a weighted average strategy.

    Effective Deposit refers to Locked GLM that has been locked in an epoch
    and is generating rewards. This is calculated as a weighted average over the epoch,
    taking into account the duration for which each deposit was locked.

    Consider the following scenario: 100 GLM is locked at the beginning of Epoch 1,
    and an additional 1000 GLM is locked halfway through Epoch 1.
    During Epoch 1, the Locked Balance will be 1100 GLM,
    but the Effective Deposit will be less than 1100 GLM,
    because the 1000 GLM has not been locked for a full epoch yet.

    The Effective Deposit is calculated as a weighted average:
    (100 GLM * full epoch duration + 1000 GLM * half epoch duration) / full epoch duration.
    This means that the deposits that were locked for longer during the epoch
    have a greater influence on the Effective Deposit.

    In Epoch 2, if no further changes to the balance are made,
    the Effective Deposit will become 1100 GLM,
    as now both deposits have been locked for a full epoch.

    Args:
        epoch_no: The epoch number for which to get the user deposits.

    Returns:
        A tuple of two elements:
            - A list of UserDeposit instances.
            - The total effective deposit.
    """
    epoch_settings = EpochsRegistry.get_epoch_settings(epoch_no)
    weighted_deposits = get_all_users_weighted_deposits(
        epoch_settings.user_deposits_weights_calculator, epoch_no
    )
    total_ed = 0
    user_deposits = []

    for address, deposits_data in weighted_deposits.items():
        effective_deposit = calculate_effective_deposit(
            deposits_data.weighted_deposits, deposits_data.epoch_end_locked_amount
        )
        total_ed = total_ed + effective_deposit
        user_deposits.append(
            UserDeposit(
                address, effective_deposit, deposits_data.epoch_end_locked_amount
            )
        )

    return user_deposits, total_ed


def get_estimated_effective_deposit(
    epoch_details: EpochDetails, user_address: str
) -> int:
    event_generator = EpochEventsGenerator(epoch_details)
    calculator = EpochsRegistry.get_epoch_settings(
        epoch_details.epoch_no
    ).user_deposits_weights_calculator
    user_deposits_data = get_user_weighted_deposits(
        calculator, event_generator, user_address
    )

    return calculate_effective_deposit(
        user_deposits_data.weighted_deposits, user_deposits_data.epoch_end_locked_amount
    )


def calculate_effective_deposit(
    deposits: List[WeightedDeposit], locked_amount: int
) -> int:
    numerator = 0
    denominator = 0
    for amount, weight in deposits:
        numerator += amount * weight
        denominator += weight

    if denominator == 0:
        return 0

    effective_deposit = int(Decimal(numerator) / Decimal(denominator))
    return apply_weighted_average_cutoff(locked_amount, effective_deposit)
