from app.context.manager import Context
from app.modules.common.project_rewards import get_projects_rewards, AllocationsPayload
from app.modules.dto import AllocationDTO, ProjectAccountFundsDTO
from app.modules.snapshots.finalized.core import FinalizedProjectRewards
from app.pydantic import Model


class FinalizingProjectRewards(Model):
    def get_finalized_project_rewards(
        self,
        context: Context,
        allocations: list[AllocationDTO],
        all_projects: list[str],
        matched_rewards: int,
    ) -> FinalizedProjectRewards:
        allocations_payload = AllocationsPayload(
            before_allocations=allocations, user_new_allocations=[]
        )
        project_rewards_result = get_projects_rewards(
            context.epoch_settings.project,
            allocations_payload,
            all_projects,
            matched_rewards,
        )

        return FinalizedProjectRewards(
            rewards=[
                ProjectAccountFundsDTO(
                    address=r.address, amount=r.allocated + r.matched, matched=r.matched
                )
                for r in project_rewards_result.rewards
                if r.allocated > 0
            ],
            rewards_sum=project_rewards_result.rewards_sum,
        )
