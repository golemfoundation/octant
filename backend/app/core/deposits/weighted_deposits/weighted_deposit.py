from dataclasses import dataclass


@dataclass(frozen=True)
class WeightedDeposit:
    """
    Class representing a weighted deposit.

    Attributes:
        amount: The deposit amount.
        weight: The duration the deposit remained locked.
    """

    amount: int
    weight: int

    def __iter__(self):
        yield self.amount
        yield self.weight
