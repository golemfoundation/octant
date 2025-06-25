from __future__ import annotations

from decimal import Decimal
from typing import Annotated

from pydantic import Field

from v2.core.types import Address, BigInteger, OctantModel


class EpochStatusResponseV1(OctantModel):
    is_current: Annotated[
        bool, Field(description="Returns True if the given epoch is the current epoch")
    ]
    is_pending: Annotated[
        bool, Field(description="Returns True if the given epoch is the pending epoch")
    ]
    is_finalized: Annotated[
        bool, Field(description="Returns True if the given epoch is a finalized epoch")
    ]


class SnapshotCreatedResponseV1(OctantModel):
    epoch: int


class OctantRewardsV1(OctantModel):
    staking_proceeds: BigInteger
    locked_ratio: Decimal
    total_effective_deposit: BigInteger
    total_rewards: BigInteger
    vanilla_individual_rewards: BigInteger
    operational_cost: BigInteger
    community_fund: BigInteger
    ppf: BigInteger


class UserDepositV1(OctantModel):
    user_address: Address
    effective_deposit: BigInteger
    deposit: BigInteger


class UserBudgetV1(OctantModel):
    user_address: Address
    budget: BigInteger


class PendingSnapshotResponseV1(OctantModel):
    rewards: OctantRewardsV1
    user_deposits: list[UserDepositV1]
    user_budgets: list[UserBudgetV1]


class ProjectRewardsV1(OctantModel):
    address: Address
    amount: BigInteger
    matched: BigInteger


class UserRewardsV1(OctantModel):
    address: Address
    amount: BigInteger


class FinalizedSnapshotResponseV1(OctantModel):
    patrons_rewards: BigInteger
    matched_rewards: BigInteger
    projects_rewards: list[ProjectRewardsV1]
    user_rewards: list[UserRewardsV1]
    total_withdrawals: BigInteger
    leftover: BigInteger
    merkle_root: str | None
