from typing import Annotated

from fastapi import Depends
from v2.core.dependencies import GetSession
from v2.epochs.dependencies import AssertAllocationWindowOpen
from v2.matched_rewards.dependencies import GetMatchedRewardsEstimator
from v2.projects.dependencies import GetProjectsContracts

from .services import ProjectRewardsEstimator


async def get_project_rewards_estimator(
    epoch_number: AssertAllocationWindowOpen,
    session: GetSession,
    projects_contracts: GetProjectsContracts,
    estimated_project_matched_rewards: GetMatchedRewardsEstimator,
) -> ProjectRewardsEstimator:
    return ProjectRewardsEstimator(
        session=session,
        projects_contracts=projects_contracts,
        matched_rewards_estimator=estimated_project_matched_rewards,
        epoch_number=epoch_number,
    )


GetProjectRewardsEstimator = Annotated[
    ProjectRewardsEstimator,
    Depends(get_project_rewards_estimator),
]
