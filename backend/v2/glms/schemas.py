from typing import Annotated

from pydantic import Field
from v2.core.types import Address, OctantModel, BigInteger


class CheckClaimGLMResponseV1(OctantModel):
    address: Annotated[Address, Field(description="Address of the user")]
    claimable: Annotated[
        BigInteger, Field(description="Amount of GLMs that can be claimed, in WEI")
    ]


class ClaimGLMRequestV1(OctantModel):
    signature: Annotated[
        str,
        Field(
            description="EIP-712 signature of a payload with the following message: {'msg': 'Claim <AMOUNT-TO-CLAIM-IN-ETHER> GLMs'} as a hexadecimal string"
        ),
    ]
