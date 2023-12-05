from dataclasses import dataclass

from app.v2.engine.user.budget import UserBudget
from app.v2.engine.user.budget.default import DefaultUserBudget
from app.v2.engine.user.effective_deposit import EffectiveDepositSettings


@dataclass
class UserSettings:
    effective_deposit: EffectiveDepositSettings = EffectiveDepositSettings()
    budget: UserBudget = DefaultUserBudget()
