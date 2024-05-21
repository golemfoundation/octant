from dataclasses import field, dataclass
from decimal import Decimal

from app.engine.projects import ProjectRewards
from app.engine.projects.rewards import (
    ProjectRewardsPayload,
    ProjectRewardsResult,
    ProjectRewardDTO,
)
from app.engine.projects.rewards.allocations import (
    ProjectAllocations,
    ProjectAllocationsPayload,
)
from app.engine.projects.rewards.allocations.quadratic_funding import (
    QuadraticFundingAllocations,
)
from app.constants import MR_FUNDING_CAP_PERCENT


@dataclass
class QuadraticFundingProjectRewards(ProjectRewards):
    projects_allocations: ProjectAllocations = field(
        default_factory=QuadraticFundingAllocations
    )

    def calculate_project_rewards(
        self, payload: ProjectRewardsPayload
    ) -> ProjectRewardsResult:
        # TODO OCT-1625 Apply Gitcoin user's score for the formula: https://linear.app/golemfoundation/issue/OCT-1624/implement-quadratic-funding
        (
            allocated_by_addr,
            total_allocated,
        ) = self.projects_allocations.group_allocations_by_projects(
            ProjectAllocationsPayload(allocations=payload.allocations)
        )
        rewards = {
            address: ProjectRewardDTO(address, 0, 0) for address in payload.projects
        }

        project_rewards_sum = 0
        funding_cap = Decimal(MR_FUNDING_CAP_PERCENT * payload.matched_rewards)
        for address, quadratic_allocated in allocated_by_addr:
            mr_percent = quadratic_allocated / Decimal(total_allocated)

            if mr_percent <= MR_FUNDING_CAP_PERCENT:
                matched = Decimal(mr_percent * payload.matched_rewards)
            else:
                matched = funding_cap

            project_rewards_sum += quadratic_allocated + matched
            project_rewards = rewards[address]
            project_rewards.allocated = int(quadratic_allocated)
            project_rewards.matched = int(matched)

        return ProjectRewardsResult(
            rewards=sorted(rewards.values(), key=lambda r: r.allocated, reverse=True),
            rewards_sum=int(project_rewards_sum),
            total_allocated=total_allocated,
            threshold=None,
            funding_cap=int(funding_cap),
        )
