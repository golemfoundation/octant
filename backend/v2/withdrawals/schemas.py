from v2.core.types import BigInteger, OctantModel


class WithdrawalsResponseV1(OctantModel):
    epoch: int
    amount: BigInteger
    proof: list[str]
    status: str
