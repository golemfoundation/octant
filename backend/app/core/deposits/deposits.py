from app.core.deposits import weighted_average_strategy
from app.core.deposits.events import SimulatedEventsGenerator
from app.core.deposits.weighted_deposits import (
    get_user_weighted_deposits,
)
from app.core.epochs.details import EpochDetails
from app.core.epochs.epochs_registry import EpochsRegistry


def estimate_effective_deposit(
    epoch: EpochDetails, amount: int, lock_duration: int
) -> int:
    epoch_settings = EpochsRegistry.get_epoch_settings(epoch.epoch_no)
    events_generator = SimulatedEventsGenerator(
        epoch.start_sec, epoch.end_sec, lock_duration, amount, epoch.remaining_sec
    )
    deposits = get_user_weighted_deposits(
        epoch_settings.user_deposits_weights_calculator, events_generator
    )
    return weighted_average_strategy.calculate_effective_deposit(deposits)
