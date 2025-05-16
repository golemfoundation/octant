from decimal import Decimal
from typing import Annotated

from fastapi import Depends
from pydantic import Field
from v2.core.dependencies import GetSession, OctantSettings
from v2.epochs.dependencies import (
    GetOpenAllocationWindowEpochNumber,
    get_epochs_subgraph,
)
from v2.epochs.subgraphs import EpochsSubgraph
from v2.matched_rewards.services import MatchedRewardsEstimator


class MatchedRewardsEstimatorSettings(OctantSettings):
    TR_PERCENT: Decimal = Field(
        default=Decimal("0.7"), description="The percentage of the TR rewards."
    )
    IRE_PERCENT: Decimal = Field(
        default=Decimal("0.35"), description="The percentage of the IRE rewards."
    )
    MATCHED_REWARDS_PERCENT: Decimal = Field(
        default=Decimal("0.35"), description="The percentage of the matched rewards."
    )


def get_matched_rewards_estimator_settings() -> MatchedRewardsEstimatorSettings:
    return MatchedRewardsEstimatorSettings()


async def get_matched_rewards_estimator_only_in_aw(
    epoch_number: GetOpenAllocationWindowEpochNumber,
    session: GetSession,
    epochs_subgraph: Annotated[EpochsSubgraph, Depends(get_epochs_subgraph)],
    settings: Annotated[
        MatchedRewardsEstimatorSettings,
        Depends(get_matched_rewards_estimator_settings),
    ],
) -> MatchedRewardsEstimator:
    return MatchedRewardsEstimator(
        session=session,
        epochs_subgraph=epochs_subgraph,
        tr_percent=settings.TR_PERCENT,
        ire_percent=settings.IRE_PERCENT,
        matched_rewards_percent=settings.MATCHED_REWARDS_PERCENT,
        epoch_number=epoch_number,
    )


async def get_matched_rewards_estimator(
    epoch_number: int,
    session: GetSession,
    epochs_subgraph: Annotated[EpochsSubgraph, Depends(get_epochs_subgraph)],
    settings: Annotated[
        MatchedRewardsEstimatorSettings,
        Depends(get_matched_rewards_estimator_settings),
    ],
) -> MatchedRewardsEstimator:
    return MatchedRewardsEstimator(
        session=session,
        epochs_subgraph=epochs_subgraph,
        tr_percent=settings.TR_PERCENT,
        ire_percent=settings.IRE_PERCENT,
        matched_rewards_percent=settings.MATCHED_REWARDS_PERCENT,
        epoch_number=epoch_number,
    )


GetMatchedRewardsSettings = Annotated[
    MatchedRewardsEstimatorSettings,
    Depends(get_matched_rewards_estimator_settings),
]

GetMatchedRewardsEstimatorInAW = Annotated[
    MatchedRewardsEstimator,
    Depends(get_matched_rewards_estimator_only_in_aw),
]

GetMatchedRewardsEstimator = Annotated[
    MatchedRewardsEstimator,
    Depends(get_matched_rewards_estimator),
]
