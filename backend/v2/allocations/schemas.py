from decimal import Decimal

from pydantic import Field
from v2.core.types import Address, BigInteger, OctantModel


class AllocationWithUserUQScore(OctantModel):
    project_address: Address
    amount: BigInteger
    user_address: Address
    user_uq_score: Decimal


class AllocationRequestV1(OctantModel):
    project_address: Address = Field(..., alias="proposalAddress")
    amount: BigInteger


class UserAllocationRequestPayloadV1(OctantModel):
    allocations: list[AllocationRequestV1]
    nonce: int


class UserAllocationRequestV1(OctantModel):
    user_address: Address
    payload: UserAllocationRequestPayloadV1
    signature: str
    is_manually_edited: bool


class UserAllocationRequest(OctantModel):
    user_address: Address
    allocations: list[AllocationRequestV1]
    nonce: int
    signature: str

    is_manually_edited: bool


class ProjectDonationV1(OctantModel):
    amount: BigInteger
    donor_address: Address = Field(alias="donor")
    project_address: Address = Field(alias="project")


class EpochDonorsResponseV1(OctantModel):
    donors: list[Address]


class EpochAllocationsResponseV1(OctantModel):
    allocations: list[ProjectDonationV1]


class UserAllocationNonceV1(OctantModel):
    allocation_nonce: int


class ProjectAllocationV1(OctantModel):
    address: Address
    amount: BigInteger


class UserAllocationsResponseV1(OctantModel):
    allocations: list[ProjectAllocationV1]
    is_manually_edited: bool | None


class SimulateAllocationPayloadV1(OctantModel):
    allocations: list[AllocationRequestV1]


class ProjectMatchedRewardsV1(OctantModel):
    address: Address
    value: BigInteger


class SimulateAllocationResponseV1(OctantModel):
    leverage: Decimal
    threshold: int
    matched: list[ProjectMatchedRewardsV1]
