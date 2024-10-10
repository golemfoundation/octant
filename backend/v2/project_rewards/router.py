from fastapi import APIRouter

from .dependencies import GetProjectRewardsEstimator
from .schemas import EstimatedProjectRewardsResponse

api = APIRouter(prefix="/rewards", tags=["Allocations"])


@api.get("/projects/estimated")
async def get_estimated_project_rewards(
    project_rewards_estimator: GetProjectRewardsEstimator,
) -> EstimatedProjectRewardsResponse:
    """
    Returns foreach project current allocation sum and estimated matched rewards.

    This endpoint is available only for the pending epoch state.
    """

    import time

    start = time.time()
    estimated_funding = await project_rewards_estimator.get()

    print("get_estimated_project_rewards took", time.time() - start, "seconds")

    return EstimatedProjectRewardsResponse(
        rewards=[f for f in estimated_funding.project_fundings.values()]
    )
