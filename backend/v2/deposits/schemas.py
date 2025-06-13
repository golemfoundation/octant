from decimal import Decimal
from v2.core.types import BigInteger, OctantModel


class TotalEffectiveDepositResponseV1(OctantModel):
    total_effective: BigInteger


class LockedRatioResponseV1(OctantModel):
    locked_ratio: Decimal


class UserEffectiveDepositResponseV1(OctantModel):
    effective_deposit: BigInteger
