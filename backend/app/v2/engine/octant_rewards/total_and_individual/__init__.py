from dataclasses import dataclass
from decimal import Decimal


@dataclass
class TotalAndAllIndividualPayload:
    eth_proceeds: int = None
    locked_ratio: Decimal = None
