from typing import List

from app.engine.user.effective_deposit.weighted_average.weights.timebased import (
    DepositWeightsPayload,
    WeightedDeposit,
    TimebasedWeights,
)


class DefaultTimebasedWeights(TimebasedWeights):
    def calculate_deposit_weights(
        self, payload: DepositWeightsPayload
    ) -> List[WeightedDeposit]:
        return self._calculate_weights(payload)
