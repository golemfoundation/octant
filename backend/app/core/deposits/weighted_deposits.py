from collections import defaultdict
from dataclasses import dataclass
from typing import Dict, List

from eth_utils import to_checksum_address

from app.core.deposits.events import SubgraphEventsGenerator, EventGenerator
from app.core.epochs import details as epochs_details


@dataclass(frozen=True)
class WeightedDeposit:
    """
    Class representing a weighted deposit.

    Attributes:
        amount: The deposit amount.
        weight: The duration the deposit remained locked.
    """

    amount: int
    weight: int

    def __iter__(self):
        yield self.amount
        yield self.weight


def get_all_users_weighted_deposits(epoch_no: int) -> Dict[str, List[WeightedDeposit]]:
    """
    Get a list of weighted deposits per user for a given epoch number. The weight of the deposit
    is calculated based on the time duration it remained locked in a given epoch.
    """
    epoch = epochs_details.get_epoch_details(epoch_no)
    events_generator = SubgraphEventsGenerator(epoch.start_sec, epoch.end_sec)
    events = events_generator.get_all_users_events()

    weighted_deposits = defaultdict(list)

    for user_address, user_events in events.items():
        weighted_amounts = _calculated_deposit_weights(
            epoch.start_sec, epoch.end_sec, user_events
        )
        weighted_deposits[to_checksum_address(user_address)] = weighted_amounts

    return weighted_deposits


def get_user_weighted_deposits(
    event_generator: EventGenerator, user_address: str = None
) -> List[WeightedDeposit]:
    """
    Get a list of weighted deposits per user for a given time range. The weight of the deposit
    is calculated based on the time duration it remained locked in a given epoch.
    """
    user_events = event_generator.get_user_events(user_address)
    if len(user_events) == 0:
        return []
    return _calculated_deposit_weights(
        event_generator.epoch_start, event_generator.epoch_end, user_events
    )


def _calculated_deposit_weights(
    start: int, end: int, user_events: List[Dict]
) -> List[WeightedDeposit]:
    weighted_amounts = []

    # Calculate deposit from the epoch start to the first event
    first_event = user_events[0]
    amount = int(first_event["depositBefore"])
    weight = first_event["timestamp"] - start
    weighted_amounts.append(WeightedDeposit(amount, weight))

    # Calculate deposit between all events
    for prev_event, next_event in zip(user_events, user_events[1:]):
        amount = int(next_event["depositBefore"])
        weight = next_event["timestamp"] - prev_event["timestamp"]
        weighted_amounts.append(WeightedDeposit(amount, weight))

    # Calculate deposit from the last event to the epoch end
    last_event = user_events[-1]
    amount = _calculate_deposit_after_event(last_event)
    weight = end - last_event["timestamp"]
    weighted_amounts.append(WeightedDeposit(amount, weight))

    return weighted_amounts


def _calculate_deposit_after_event(event: Dict) -> int:
    if event["__typename"] == "Locked":
        return int(event["depositBefore"]) + int(event["amount"])
    else:
        return int(event["depositBefore"]) - int(event["amount"])
