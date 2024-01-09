from dataclasses import dataclass

from dataclass_wizard import JSONWizard


@dataclass(frozen=True)
class Allocation(JSONWizard):
    proposal_address: str
    amount: int
