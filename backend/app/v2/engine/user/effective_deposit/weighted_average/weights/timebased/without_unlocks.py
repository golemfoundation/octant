from functools import reduce
from itertools import groupby
from typing import List, Tuple

from app.v2.engine.user.effective_deposit.weighted_average.weights.timebased import (
    DepositWeightsPayload,
    WeightedDeposit,
    TimebasedWeights,
)


class TimebasedWithoutUnlocksWeights(TimebasedWeights):
    def calculate_deposit_weights(
        self, payload: DepositWeightsPayload
    ) -> List[WeightedDeposit]:
        weighted_deposits: List[WeightedDeposit] = self._calculate_weights(payload)

        if len(weighted_deposits) == 0:
            return []

        last_deposit_weight = weighted_deposits[-1]

        min_val_reduced, _ = reduce(
            min_value_reducer,
            reversed(weighted_deposits),
            ([], last_deposit_weight.amount),
        )

        merged_deposits = [
            WeightedDeposit(amount, sum(map(lambda wd: wd.weight, wds)))
            for amount, wds in groupby(min_val_reduced, lambda wd: wd.amount)
        ]

        return sorted(merged_deposits, key=lambda wd: (wd.weight, wd.amount))


def min_value_reducer(val: Tuple[List[WeightedDeposit], int], elem: WeightedDeposit):
    deposits, last_deposit_amount = val

    if elem.amount >= last_deposit_amount:
        deposits.append(WeightedDeposit(last_deposit_amount, elem.weight))
        return deposits, last_deposit_amount
    else:
        deposits.append(elem)
        return deposits, elem.amount
