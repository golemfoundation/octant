from dataclasses import dataclass

from dataclass_wizard import JSONWizard


@dataclass(frozen=True)
class AddressAndAmount(JSONWizard):
    address: str
    amount: int

    def __iter__(self):
        yield self.address
        yield self.amount
