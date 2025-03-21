from pydantic import Field
from v2.core.types import Address, OctantModel


class DelegationRequestV1(OctantModel):
    primary_address: Address = Field(
        alias="primaryAddr",
        description="Address that receives delegated score",
    )
    secondary_address: Address = Field(
        alias="secondaryAddr",
        description="Address that donates delegated score",
    )
    primary_signature: str = Field(
        alias="primaryAddrSignature",
        description="Signature of the message: Delegation of UQ score from {secondary_addr} to {primary_addr}",
    )
    secondary_signature: str = Field(
        alias="secondaryAddrSignature",
        description="Signature of the message: Delegation of UQ score from {secondary_addr} to {primary_addr}",
    )


class DelegationCheckResponseV1(OctantModel):
    primary: Address | None = Field(description="Address that receives delegated score")
    secondary: Address | None = Field(
        description="Address that donates delegated score"
    )
