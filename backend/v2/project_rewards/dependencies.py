from typing import Annotated

from fastapi import Depends
from v2.core.dependencies import GetSession
from v2.epochs.dependencies import GetOpenAllocationWindowEpochNumber
from v2.matched_rewards.dependencies import GetMatchedRewardsEstimatorInAW
from v2.project_rewards.services import ProjectRewardsEstimator
from v2.projects.dependencies import GetProjectsContracts


async def get_project_rewards_estimator(
    epoch_number: GetOpenAllocationWindowEpochNumber,
    session: GetSession,
    projects_contracts: GetProjectsContracts,
    estimated_project_matched_rewards: GetMatchedRewardsEstimatorInAW,
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
