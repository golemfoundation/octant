from dataclasses import dataclass

from dataclass_wizard import JSONWizard


@dataclass(frozen=True)
class UserDeposit(JSONWizard):
    user_address: str
    effective_deposit: int
    deposit: int


@dataclass(frozen=True)
class AccountFunds(JSONWizard):
    address: str
    amount: int
    matched: int = 0

    def __iter__(self):
        yield self.address
        yield self.amount
        yield self.matched
