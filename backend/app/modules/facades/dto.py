from dataclasses import dataclass

from dataclass_wizard import JSONWizard


@dataclass
class EstimatedRewardsDTO(JSONWizard):
    estimated_budget: int
    matching_fund: int
    leverage: float
