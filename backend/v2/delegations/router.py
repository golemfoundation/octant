from typing import Annotated
from fastapi import APIRouter, Depends

from app.exceptions import DelegationCheckWrongParams, DelegationDoesNotExist
from v2.core.types import Address
from v2.core.transformers import transform_to_checksum_address
from v2.delegations.dependencies import GetDelegationService
from v2.delegations.schemas import DelegationRequestV1, DelegationCheckResponseV1


api = APIRouter(prefix="/delegation", tags=["Delegations"])


@api.post("/delegate", status_code=201)
async def delegate_uq_score_v1(
    request: DelegationRequestV1,
) -> None:
    """
    Delegate UQ score from secondary address to primary address
    """
    pass


@api.put("/recalculate", status_code=204)
async def recalculate_uq_score_v1(
    request: DelegationRequestV1,
) -> None:
    """
    Recalculate UQ score from secondary address to primary address
    """

    pass



def validate_comma_separated_addresses(addresses: str) -> list[Address]:
    """
    Convert comma-separated addresses to a list of checksum addresses
    """

    tokens = addresses.split(",")
    if not (2 <= len(tokens) <= 10):
        raise DelegationCheckWrongParams()

    return [
        transform_to_checksum_address(token)
        for token in tokens
    ]


@api.get("/check/{user_addresses}")
async def check_delegation_v1(
    delegation_service: GetDelegationService,
    # Request Parameters
    user_addresses: Annotated[list[Address], Depends(validate_comma_separated_addresses)],
) -> DelegationCheckResponseV1:
    """
    Check if the user has delegated UQ score to another address
    """

    # Find all delegations for any combination of given addresses
    pairs = await delegation_service.find_all(user_addresses)
    if not pairs:
        raise DelegationDoesNotExist()

    secondary, primary = pairs[0]
    return DelegationCheckResponseV1(
        primary=primary,
        secondary=secondary,
    )
