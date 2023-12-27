from collections import defaultdict
from typing import List, Dict

from app.core.deposits.events import EventGenerator, DepositEvent, EventType

from app.core.deposits.weighted_deposits.weighted_deposit import WeightedDeposit
from app.core.deposits.weighted_deposits.weights_calculator import WeightsCalculator


class TimebasedWeightsCalculator(WeightsCalculator):
    @classmethod
    def compute_all_users_weigted_deposits(
        cls, events_generator: EventGenerator
    ) -> Dict[str, List[WeightedDeposit]]:
        """
        Get a list of weighted deposits per user for a given epoch number. The weight of the deposit
        is calculated based on the time duration it remained locked in a given epoch.
        """
        events = events_generator.get_all_users_events()

        weighted_deposits = defaultdict(list)

        for user_address, user_events in events.items():
            weighted_amounts = cls._calculated_deposit_weights(
                events_generator.epoch_start, events_generator.epoch_end, user_events
            )
            weighted_deposits[user_address] = weighted_amounts

        return weighted_deposits

    @classmethod
    def compute_user_weighted_deposits(
        cls, events_generator: EventGenerator, user_address: str = None
    ) -> List[WeightedDeposit]:
        """
        Get a list of weighted deposits per user for a given time range. The weight of the deposit
        is calculated based on the time duration it remained locked in a given epoch.
        """
        user_events = events_generator.get_user_events(user_address)
        return cls._calculated_deposit_weights(
            events_generator.epoch_start, events_generator.epoch_end, user_events
        )

    @classmethod
    def _calculated_deposit_weights(
        cls, start: int, end: int, user_events: List[DepositEvent]
    ) -> List[WeightedDeposit]:
        if len(user_events) == 0:
            return []

        weighted_amounts = []

        # Calculate deposit from the epoch start to the first event
        first_event = user_events[0]
        amount = first_event.deposit_before
        weight = first_event.timestamp - start
        weighted_amounts.append(WeightedDeposit(amount, weight))

        # Calculate deposit between all events
        for prev_event, next_event in zip(user_events, user_events[1:]):
            amount = next_event.deposit_before
            weight = next_event.timestamp - prev_event.timestamp
            weighted_amounts.append(WeightedDeposit(amount, weight))

        # Calculate deposit from the last event to the epoch end
        last_event = user_events[-1]
        amount = cls._calculate_deposit_after_event(last_event)
        weight = end - last_event.timestamp
        weighted_amounts.append(WeightedDeposit(amount, weight))

        return list(filter(lambda wd: wd.weight != 0, weighted_amounts))

    @classmethod
    def _calculate_deposit_after_event(cls, event: DepositEvent) -> int:
        if event.type == EventType.LOCK:
            return event.deposit_before + event.amount
        elif event.type == EventType.UNLOCK:
            return event.deposit_before - event.amount
        else:
            raise TypeError
