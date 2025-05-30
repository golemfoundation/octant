from __future__ import annotations


from v2.allocations.schemas import UserAllocationRequestRawV1
from v2.core.types import OctantModel


class PendingSignatureRequestV1(OctantModel):
    message: str | UserAllocationRequestRawV1


class PendingSignatureResponseV1(OctantModel):
    message: str | None
    hash: str | None
