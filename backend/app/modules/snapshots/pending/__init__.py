from dataclasses import dataclass
from dataclass_wizard import JSONWizard


@dataclass(frozen=True)
class UserBudgetInfo(JSONWizard):
    user_address: str
    budget: int
