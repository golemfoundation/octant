from pydantic import Field
from v2.core.types import Address, BigInteger, OctantModel


class ProjectFundingSummaryV1(OctantModel):
    address: Address = Field(..., description="The address of the project")
    allocated: BigInteger = Field(
        ..., description="Sum of all allocation amounts for the project"
    )
    matched: BigInteger = Field(
        ..., description="Sum of matched rewards for the project"
    )


class EstimatedProjectRewardsResponseV1(OctantModel):
    rewards: list[ProjectFundingSummaryV1] = Field(
        ..., description="List of project funding summaries"
    )


class EstimatedBudgetByEpochRequestV1(OctantModel):
    number_of_epochs: int = Field(
        ..., description="Number of epochs when GLM are locked", ge=0
    )
    glm_amount: BigInteger = Field(
        ..., description="Amount of estimated GLM locked in wei", ge=0
    )


class UserBudgetWithMatchedFundingResponseV1(OctantModel):
    budget: BigInteger = Field(..., description="User budget for given epoch in wei.")
    matched_funding: BigInteger = Field(
        ..., description="Matched funding for given epoch in wei."
    )


class EstimatedBudgetByDaysRequestV1(OctantModel):
    days: int = Field(..., description="Number of days when GLM are locked")
    glm_amount: BigInteger = Field(
        ..., description="Amount of estimated GLM locked in wei"
    )


class RewardsMerkleTreeLeafV1(OctantModel):
    address: Address = Field(..., description="User account or project address")
    amount: BigInteger = Field(..., description="Assigned reward")


class RewardsMerkleTreeResponseV1(OctantModel):
    epoch: int = Field(..., description="Epoch number")
    rewards_sum: BigInteger = Field(
        ..., description="Sum of assigned rewards for epoch"
    )
    root: str = Field(..., description="Merkle Tree root for epoch")
    leaves: list[RewardsMerkleTreeLeafV1] = Field(
        ..., description="List of Merkle Tree leaves"
    )
    leaf_encoding: list[str] = Field(..., description="Merkle tree leaf encoding")


class UserBudgetResponseV1(OctantModel):
    budget: BigInteger = Field(..., description="User budget for given epoch in wei.")


class EpochBudgetItemV1(OctantModel):
    address: Address = Field(..., description="User address")
    amount: BigInteger = Field(..., description="User budget for given epoch in wei.")


class EpochBudgetsResponseV1(OctantModel):
    budgets: list[EpochBudgetItemV1] = Field(
        ..., description="List of user budgets for given epoch"
    )


class UpcomingUserBudgetResponseV1(OctantModel):
    upcoming_budget: BigInteger = Field(
        ..., description="Calculated upcoming user budget."
    )


class ThresholdResponseV1(OctantModel):
    threshold: BigInteger = Field(
        ...,
        description="Threshold, that projects have to pass to be eligible for receiving rewards.",
    )


class RewardsLeverageResponseV1(OctantModel):
    leverage: float = Field(..., description="Leverage of the allocated funds")


class UnusedRewardsResponseV1(OctantModel):
    addresses: list[Address] = Field(
        ...,
        description="List of addresses that neither allocated rewards nor toggled patron mode",
    )
    value: BigInteger = Field(
        ..., description="Total unused rewards sum in an epoch (WEI)"
    )
