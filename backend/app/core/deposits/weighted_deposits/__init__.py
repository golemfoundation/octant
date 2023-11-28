from typing import Dict, List, Type

from app.core.epochs import details as epochs_details
from app.core.deposits.events import SubgraphEventsGenerator, EventGenerator

from app.core.deposits.weighted_deposits.weights_calculator import WeightsCalculator
from app.core.deposits.weighted_deposits.weighted_deposit import WeightedDeposit


def get_all_users_weighted_deposits(
    weights_calculator: Type[WeightsCalculator], epoch_no: int
) -> Dict[str, List[WeightedDeposit]]:
    """
    Get a list of weighted deposits per user for a given epoch number.
    """

    epoch = epochs_details.get_epoch_details(epoch_no)
    events_generator = SubgraphEventsGenerator(epoch.start_sec, epoch.end_sec)

    weighted_deposits = weights_calculator.compute_all_users_weigted_deposits(
        events_generator
    )

    return weighted_deposits


def get_user_weighted_deposits(
    weights_calculator: Type[WeightsCalculator],
    events_generator: EventGenerator,
    user_address: str = None,
) -> List[WeightedDeposit]:
    """
    Get a list of weighted deposits per user for a given time range.
    """

    weighted_deposits = weights_calculator.compute_user_weighted_deposits(
        events_generator, user_address
    )
    return weighted_deposits
