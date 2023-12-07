from dataclasses import dataclass, field

from app.v2.engine.user.budget import UserBudget
from app.v2.engine.user.budget.default import DefaultUserBudget
from app.v2.engine.user.effective_deposit import EffectiveDepositSettings


@dataclass
class UserSettings:
    effective_deposit: EffectiveDepositSettings = field(
        default_factory=EffectiveDepositSettings
    )
    budget: UserBudget = DefaultUserBudget()
