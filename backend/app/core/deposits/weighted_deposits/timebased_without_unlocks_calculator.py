from typing import List, Dict, Tuple

from itertools import groupby
from functools import reduce

from app.core.deposits.weighted_deposits.weighted_deposit import WeightedDeposit
from app.core.deposits.weighted_deposits.timebased_calculator import (
    TimebasedWeightsCalculator,
)


class TimebasedWithoutUnlocksWeightsCalculator(TimebasedWeightsCalculator):
    @classmethod
    def _calculated_deposit_weights(
        cls, start: int, end: int, user_events: List[Dict]
    ) -> List[WeightedDeposit]:
        weighted_deposits: List[
            WeightedDeposit
        ] = TimebasedWeightsCalculator._calculated_deposit_weights(
            start, end, user_events
        )

        if len(weighted_deposits) == 0:
            return []

        last_deposit_weight = weighted_deposits[-1]

        min_val_reduced, _ = reduce(
            cls._min_value_reducer,
            reversed(weighted_deposits),
            ([], last_deposit_weight.amount),
        )

        merged_deposits = [
            WeightedDeposit(amount, sum(map(lambda wd: wd.weight, wds)))
            for amount, wds in groupby(min_val_reduced, lambda wd: wd.amount)
        ]

        return sorted(merged_deposits, key=lambda wd: (wd.weight, wd.amount))

    @classmethod
    def _min_value_reducer(
        cls, val: Tuple[List[WeightedDeposit], int], elem: WeightedDeposit
    ):
        deposits, last_deposit_amount = val

        if elem.amount >= last_deposit_amount:
            deposits.append(WeightedDeposit(last_deposit_amount, elem.weight))
            return deposits, last_deposit_amount
        else:
            deposits.append(elem)
            return deposits, elem.amount
