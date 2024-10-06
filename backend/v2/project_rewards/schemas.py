from decimal import Decimal
from pydantic import BaseModel, Field

from v2.core.types import Address


class ProjectFundingSummary(BaseModel):
    address: Address = Field(..., description="The address of the project")
    allocated: int = Field(
        ..., description="Sum of all allocation amounts for the project"
    )
    matched: int = Field(..., description="Sum of matched rewards for the project")


class EstimatedProjectRewardsResponse(BaseModel):
    rewards: list[ProjectFundingSummary] = Field(
        ..., description="List of project funding summaries"
    )


# project_rewards = await project_rewards_estimator.get(pending_epoch_number)
#     rewards = [
#         {
#             "address": project_address,
#             "allocated": str(project_rewards.amounts_by_project[project_address]),
#             "matched": str(project_rewards.matched_by_project[project_address]),
#         }
#         for project_address in project_rewards.amounts_by_project.keys()
#     ]

# @ns.doc(
#     description="Returns project rewards with estimated matched rewards for the pending epoch"
# )
# @ns.response(
#     200,
#     "",
# )
# @ns.route("/projects/estimated")
# class EstimatedProjectRewards(OctantResource):
#     @ns.marshal_with(projects_rewards_model)
#     def get(self):
#         app.logger.debug("Getting project rewards for the pending epoch")
#         project_rewards = get_estimated_project_rewards().rewards
#         app.logger.debug(f"Project rewards in the pending epoch: {project_rewards}")

#         return {"rewards": project_rewards}
