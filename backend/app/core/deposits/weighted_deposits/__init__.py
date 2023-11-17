from typing import Dict, List

from app.core.epochs import details as epochs_details
from app.core.epochs.epochs_registry import EpochsRegistry
from app.core.deposits.events import SubgraphEventsGenerator, EventGenerator

from app.core.deposits.weighted_deposits.weights_calculator import WeightsCalculator
from app.core.deposits.weighted_deposits.timebased_calculator import (
    TimebasedWeightsCalculator,
)
from app.core.deposits.weighted_deposits.weighted_deposit import WeightedDeposit


def get_all_users_weighted_deposits(epoch_no: int) -> Dict[str, List[WeightedDeposit]]:
    """
    Get a list of weighted deposits per user for a given epoch number.
    """

    epoch = epochs_details.get_epoch_details(epoch_no)
    events_generator = SubgraphEventsGenerator(epoch.start_sec, epoch.end_sec)

    calculator: WeightsCalculator = _get_calculator(epoch_no)

    weighted_deposits = calculator.compute_all_users_weigted_deposits(events_generator)

    return weighted_deposits


def get_user_weighted_deposits(
    events_generator: EventGenerator, user_address: str = None
) -> List[WeightedDeposit]:
    """
    Get a list of weighted deposits per user for a given time range.
    """

    calculator: WeightsCalculator = _get_calculator(None)
    weighted_deposits = calculator.compute_user_weighted_deposits(
        events_generator, user_address
    )
    return weighted_deposits


def _get_calculator(epoch: int) -> WeightsCalculator:
    # epoch_settings = EpochsRegistry.get_epoch_settings(epoch)
    # return epoch_settings.deposit_weights_calculator
    return TimebasedWeightsCalculator
