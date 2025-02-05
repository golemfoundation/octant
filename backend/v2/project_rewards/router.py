from fastapi import APIRouter
from v2.project_rewards.dependencies import GetProjectRewardsEstimator
from v2.project_rewards.schemas import EstimatedProjectRewardsResponse

api = APIRouter(prefix="/rewards", tags=["Allocations"])


@api.get("/projects/estimated")
async def get_estimated_project_rewards(
    project_rewards_estimator: GetProjectRewardsEstimator,
) -> EstimatedProjectRewardsResponse:
    """
    Returns foreach project current allocation sum and estimated matched rewards.

    This endpoint is available only for the pending epoch state.
    """

    estimated_funding = await project_rewards_estimator.get()

    return EstimatedProjectRewardsResponse(
        rewards=[f for f in estimated_funding.project_fundings.values()]
    )
