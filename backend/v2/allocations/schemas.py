from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field
from pydantic.alias_generators import to_camel

class AllocationWithUserUQScore(BaseModel):
    model_config = ConfigDict(frozen=True)

    project_address: str
    amount: int
    user_address: str
    user_uq_score: Decimal


class AllocationRequest(BaseModel):
    model_config = ConfigDict(frozen=True, alias_generator=to_camel)

    project_address: str = Field(..., alias='proposalAddress')
    amount: int


    # first_name: str = Field(..., alias='firstName')
    # last_name: str = Field(..., alias='lastName')
    # age: int = Field(..., alias='age')

class UserAllocationRequestPayloadV1(BaseModel):
    model_config = ConfigDict(frozen=True, alias_generator=to_camel)

    allocations: list[AllocationRequest]
    nonce: int

class UserAllocationRequestV1(BaseModel):
    model_config = ConfigDict(frozen=True, alias_generator=to_camel)

    user_address: str
    payload: UserAllocationRequestPayloadV1
    signature: str
    is_manually_edited: bool


class UserAllocationRequest(BaseModel):
    model_config = ConfigDict(frozen=True)

    user_address: str
    allocations: list[AllocationRequest]
    nonce: int
    signature: str

    is_manually_edited: bool


class ProjectDonation(BaseModel):
    model_config = ConfigDict(frozen=True)

    amount: int
    donor_address: str  # user address
    project_address: str
