from dataclasses import dataclass, field

from app.v2.engine.user.effective_deposit.cut_off import CutOff
from app.v2.engine.user.effective_deposit.cut_off.cutoff_10glm import CutOff10GLM
from app.v2.engine.user.effective_deposit.weighted_average.weights.timebased import (
    TimebasedWeights,
)
from app.v2.engine.user.effective_deposit.weighted_average.weights.timebased.without_unlocks import (
    TimebasedWithoutUnlocksWeights,
)


@dataclass
class EffectiveDepositSettings:
    cut_off: CutOff = field(default_factory=CutOff10GLM)
    timebased_weights: TimebasedWeights = field(
        default_factory=TimebasedWithoutUnlocksWeights
    )
