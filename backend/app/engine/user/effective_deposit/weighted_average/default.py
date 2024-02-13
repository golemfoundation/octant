from dataclasses import dataclass, field
from decimal import Decimal
from typing import Tuple, List

from app.engine.user.effective_deposit import (
    UserEffectiveDeposit,
    UserEffectiveDepositPayload,
    UserDeposit,
)
from app.engine.user.effective_deposit.cut_off import CutOffPayload, CutOff
from app.engine.user.effective_deposit.cut_off.cutoff_10glm import CutOff10GLM
from app.engine.user.effective_deposit.weighted_average.weights.timebased import (
    DepositWeightsPayload,
    WeightedDeposit,
    TimebasedWeights,
)
from app.engine.user.effective_deposit.weighted_average.weights.timebased.without_unlocks import (
    TimebasedWithoutUnlocksWeights,
)


@dataclass
class DefaultWeightedAverageEffectiveDeposit(UserEffectiveDeposit):
    cut_off: CutOff = field(default_factory=CutOff10GLM)
    timebased_weights: TimebasedWeights = field(
        default_factory=TimebasedWithoutUnlocksWeights
    )

    def calculate_users_effective_deposits(
        self, payload: UserEffectiveDepositPayload
    ) -> Tuple[List[UserDeposit], int]:
        total_effective_deposit = 0
        user_deposits = []

        for address, events in payload.lock_events_by_addr.items():
            locked_amount = events[-1].deposit_after if events else 0
            weighted_deposits = self.timebased_weights.calculate_deposit_weights(
                DepositWeightsPayload(
                    start=payload.epoch_start, end=payload.epoch_end, user_events=events
                )
            )
            effective_deposit = self._calculate_effective_deposit(
                weighted_deposits, locked_amount
            )
            total_effective_deposit = total_effective_deposit + effective_deposit
            user_deposits.append(UserDeposit(address, effective_deposit, locked_amount))

        return user_deposits, total_effective_deposit

    def _calculate_effective_deposit(
        self, weighted_deposits: List[WeightedDeposit], locked_amount: int
    ) -> int:
        numerator = 0
        denominator = 0
        for amount, weight in weighted_deposits:
            numerator += amount * weight
            denominator += weight

        if denominator == 0:
            return 0

        effective_deposit = int(Decimal(numerator) / Decimal(denominator))
        return self.cut_off.apply_cutoff(
            CutOffPayload(
                locked_amount=locked_amount, effective_amount=effective_deposit
            )
        )
