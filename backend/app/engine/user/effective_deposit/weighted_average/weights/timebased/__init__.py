from abc import ABC, abstractmethod
from dataclasses import dataclass
from typing import List

from app.engine.user.effective_deposit import DepositEvent


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


@dataclass
class DepositWeightsPayload:
    start: int = None
    end: int = None
    user_events: List[DepositEvent] = None


@dataclass
class TimebasedWeights(ABC):
    @abstractmethod
    def calculate_deposit_weights(
        self, payload: DepositWeightsPayload
    ) -> List[WeightedDeposit]:
        pass

    def _calculate_weights(
        self, payload: DepositWeightsPayload
    ) -> List[WeightedDeposit]:
        user_events = payload.user_events
        if len(user_events) == 0:
            return []

        weighted_amounts = []

        # Calculate deposit from the epoch start to the first event
        first_event = user_events[0]
        weight = first_event.timestamp - payload.start
        weighted_amounts.append(WeightedDeposit(first_event.deposit_before, weight))

        # Calculate deposit between all events
        for prev_event, next_event in zip(user_events, user_events[1:]):
            weight = next_event.timestamp - prev_event.timestamp
            weighted_amounts.append(WeightedDeposit(next_event.deposit_before, weight))

        # Calculate deposit from the last event to the epoch end
        last_event = user_events[-1]
        weight = payload.end - last_event.timestamp
        weighted_amounts.append(WeightedDeposit(last_event.deposit_after, weight))

        return [wd for wd in weighted_amounts if wd.weight != 0]
