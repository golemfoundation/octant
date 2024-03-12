from dataclasses import dataclass
from dataclass_wizard import JSONWizard


@dataclass(frozen=True)
class UserBudgetInfo(JSONWizard):
    address: str
    budget: int
