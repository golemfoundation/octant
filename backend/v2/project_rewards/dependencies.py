from typing import Annotated
from fastapi import Depends
from v2.core.exceptions import AllocationWindowClosed
from v2.epochs.dependencies import AssertAllocationWindowOpen, GetEpochsContracts
from v2.matched_rewards.dependencies import GetMatchedRewardsEstimator
from v2.projects.dependencies import GetProjectsContracts
from v2.core.dependencies import GetSession

from .services import ProjectRewardsEstimator


async def get_project_rewards_estimator(
    epoch_number: AssertAllocationWindowOpen,
    session: GetSession,
    projects_contracts: GetProjectsContracts,
    estimated_project_matched_rewards: GetMatchedRewardsEstimator,
) -> ProjectRewardsEstimator:
    print("session id", id(session))
    print("session identity", session)

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
