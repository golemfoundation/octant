from typing import Annotated

from pydantic import Field
from v2.core.types import BigInteger, OctantModel


class CurrentEpochResponseV1(OctantModel):
    current_epoch: int


class IndexedEpochResponseV1(OctantModel):
    current_epoch: int
    indexed_epoch: int


class EpochStatsResponseV1(OctantModel):
    epoch: Annotated[int, Field(description="Epoch number")]
    staking_proceeds: Annotated[
        BigInteger, Field(description="ETH proceeds from staking for the given epoch.")
    ]
    total_effective_deposit: Annotated[
        BigInteger, Field(description="Effectively locked GLMs for the given epoch")
    ]
    total_rewards: Annotated[
        BigInteger, Field(description="Total rewards for the given epoch.")
    ]
    vanilla_individual_rewards: Annotated[
        BigInteger, Field(description="Total rewards budget allocated to users rewards")
    ]
    operational_cost: Annotated[
        BigInteger, Field(description="The amount needed to cover the Octant's costs")
    ]
    total_withdrawals: Annotated[
        BigInteger | None,
        Field(description="Rewards users decided to withdraw for the given epoch."),
    ]
    patrons_rewards: Annotated[
        BigInteger | None,
        Field(description="Matching fund budget coming from patrons."),
    ]
    matched_rewards: Annotated[
        BigInteger | None,
        Field(
            description="Total matched rewards for the given epoch. Includes matchedRewards from Golem Foundation and patronRewards."
        ),
    ]
    leftover: Annotated[
        BigInteger | None,
        Field(
            description="The amount that will be used to increase staking and for other Octant related operations. Includes donations to projects that didn't reach the threshold."
        ),
    ]
    ppf: Annotated[
        BigInteger | None,
        Field(
            description="PPF for the given epoch. It's calculated based on subtracting Vanillia Individual Rewards from Individual Rewards Equilibrium."
        ),
    ]
    community_fund: Annotated[
        BigInteger | None,
        Field(
            description="Community fund for the given epoch. It's calculated from staking proceeds directly."
        ),
    ]
    donated_to_projects: Annotated[
        BigInteger | None,
        Field(description="Donations to projects that didn't reach the threshold."),
    ]
    staking_matched_reserved_for_v2: Annotated[
        BigInteger,
        Field(
            default=0,
            description="Staking portion reserved for v2 (not distributed in this epoch)",
        ),
    ]


class EpochRewardsRateResponseV1(OctantModel):
    rewards_rate: float
