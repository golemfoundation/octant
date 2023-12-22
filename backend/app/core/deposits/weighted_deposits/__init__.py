from typing import Dict, List, Type
from dataclasses import dataclass


from app.core.epochs import details as epochs_details
from app.core.deposits.events import SubgraphEventsGenerator, EventGenerator

from app.core.deposits.weighted_deposits.weights_calculator import WeightsCalculator
from app.core.deposits.weighted_deposits.weighted_deposit import WeightedDeposit


@dataclass(frozen=True)
class UserEpochDepositData:
    weighted_deposits: List[WeightedDeposit]
    epoch_end_locked_amount: int


def get_all_users_weighted_deposits(
    weights_calculator: Type[WeightsCalculator], epoch_no: int
) -> Dict[str, UserEpochDepositData]:
    """
    Get a list of weighted deposits per user for a given epoch number.
    """

    epoch = epochs_details.get_epoch_details(epoch_no)
    events_generator = SubgraphEventsGenerator(epoch.start_sec, epoch.end_sec)

    weighted_deposits = weights_calculator.compute_all_users_weigted_deposits(
        events_generator
    )

    deposits_data = dict()

    for user, user_weighted_deposits in weighted_deposits.items():
        user_deposit_data = UserEpochDepositData(
            weighted_deposits=user_weighted_deposits,
            epoch_end_locked_amount=_get_user_locked_amount(
                events_generator.get_user_events(user)
            ),
        )

        deposits_data[user] = user_deposit_data

    return deposits_data


def get_user_weighted_deposits(
    weights_calculator: Type[WeightsCalculator],
    events_generator: EventGenerator,
    user_address: str = None,
) -> UserEpochDepositData:
    """
    Get a list of weighted deposits per user for a given time range.
    """

    weighted_deposits = weights_calculator.compute_user_weighted_deposits(
        events_generator, user_address
    )

    locked_amount = _get_user_locked_amount(
        events_generator.get_user_events(user_address)
    )

    return UserEpochDepositData(
        weighted_deposits=weighted_deposits, epoch_end_locked_amount=locked_amount
    )


def _get_user_locked_amount(user_deposits: List[Dict]):
    if user_deposits == []:
        return 0

    last_deposit_event = user_deposits[-1]

    deposit_before = int(last_deposit_event["depositBefore"])
    deposit_amount = int(last_deposit_event["amount"])

    lock_unlock_mulitiplier = 1 if last_deposit_event["__typename"] == "Locked" else -1

    return deposit_before + deposit_amount * lock_unlock_mulitiplier
