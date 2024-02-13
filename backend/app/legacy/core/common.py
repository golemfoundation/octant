from dataclasses import dataclass

from dataclass_wizard import JSONWizard


@dataclass(frozen=True)
class AccountFunds(JSONWizard):
    address: str
    amount: int
    matched: int = None

    def __iter__(self):
        yield self.address
        yield self.amount
        yield self.matched
