from decimal import Decimal

from pydantic import Field
from v2.core.types import Address, BigInteger, OctantModel


class AllocationWithUserUQScore(OctantModel):
    project_address: Address
    amount: BigInteger
    user_address: Address
    user_uq_score: Decimal


class AllocationRequest(OctantModel):
    project_address: Address = Field(..., alias="proposalAddress")
    amount: BigInteger


class UserAllocationRequestPayloadV1(OctantModel):
    allocations: list[AllocationRequest]
    nonce: int


class UserAllocationRequestV1(OctantModel):
    user_address: Address
    payload: UserAllocationRequestPayloadV1
    signature: str
    is_manually_edited: bool


class UserAllocationRequest(OctantModel):
    user_address: Address
    allocations: list[AllocationRequest]
    nonce: int
    signature: str

    is_manually_edited: bool


class ProjectDonation(OctantModel):
    amount: BigInteger
    donor_address: Address  # user address
    project_address: Address
