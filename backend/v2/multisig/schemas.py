from __future__ import annotations


from v2.allocations.schemas import UserAllocationRequestV1
from v2.core.types import OctantModel


class PendingSignatureRequestV1(OctantModel):
    message: str | UserAllocationRequestV1


class PendingSignatureResponseV1(OctantModel):
    message: str | None
    hash: str | None
