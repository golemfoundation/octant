from dataclasses import dataclass, field

from app.engine.user.budget import UserBudget
from app.engine.user.budget.default import DefaultUserBudget
from app.engine.user.effective_deposit import UserEffectiveDeposit
from app.engine.user.effective_deposit.weighted_average.default import (
    DefaultWeightedAverageEffectiveDeposit,
)


@dataclass
class UserSettings:
    effective_deposit: UserEffectiveDeposit = field(
        default_factory=DefaultWeightedAverageEffectiveDeposit
    )
    budget: UserBudget = field(default_factory=DefaultUserBudget)
