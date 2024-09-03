from decimal import Decimal

from pydantic import BaseModel, ConfigDict


class AllocationWithUserUQScore(BaseModel):
    model_config = ConfigDict(frozen=True)

    project_address: str
    amount: int
    user_address: str
    user_uq_score: Decimal


class AllocationRequest(BaseModel):
    model_config = ConfigDict(frozen=True)

    project_address: str
    amount: int


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
