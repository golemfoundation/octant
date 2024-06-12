from dataclasses import field, dataclass
from decimal import Decimal

from app.engine.projects.rewards import (
    ProjectRewardsPayload,
    ProjectRewardsResult,
    ProjectRewards,
    ProjectRewardDTO,
)
from app.engine.projects.rewards.allocations import (
    ProjectAllocations,
    ProjectAllocationsPayload,
)
from app.engine.projects.rewards.allocations.preliminary import (
    PreliminaryProjectAllocations,
)
from app.engine.projects.rewards.threshold import (
    ProjectThreshold,
    ProjectThresholdPayload,
)
from app.engine.projects.rewards.threshold.preliminary import (
    PreliminaryProjectThreshold,
)


@dataclass
class PreliminaryProjectRewards(ProjectRewards):
    projects_allocations: ProjectAllocations = field(
        default_factory=PreliminaryProjectAllocations
    )
    projects_threshold: ProjectThreshold = field(
        default_factory=lambda: PreliminaryProjectThreshold(1)
    )

    def calculate_threshold(self, total_allocated: int, projects: list[str]) -> int:
        return self.projects_threshold.calculate_threshold(
            ProjectThresholdPayload(
                total_allocated=total_allocated, projects_count=len(projects)
            )
        )

    def calculate_project_rewards(
        self, payload: ProjectRewardsPayload
    ) -> ProjectRewardsResult:
        (
            allocated_by_addr,
            total_allocated,
        ) = self.projects_allocations.group_allocations_by_projects(
            ProjectAllocationsPayload(allocations=payload.allocations)
        )
        threshold = self.calculate_threshold(total_allocated, payload.projects)

        total_allocated_above_threshold = sum(
            [
                allocation.amount
                for allocation in allocated_by_addr
                if allocation.amount > threshold
            ]
        )

        project_rewards_sum = 0

        rewards = {
            address: ProjectRewardDTO(address, 0, 0) for address in payload.projects
        }

        for allocation in allocated_by_addr:
            address = allocation.project_address
            allocated = allocation.amount

            matched = 0
            if allocated > threshold:
                matched = int(
                    Decimal(allocated)
                    / Decimal(total_allocated_above_threshold)
                    * payload.matched_rewards
                )
                project_rewards_sum += allocated + matched

            project_rewards = rewards[address]
            project_rewards.allocated = allocated
            project_rewards.matched = matched

        return ProjectRewardsResult(
            rewards=sorted(rewards.values(), key=lambda r: r.allocated, reverse=True),
            rewards_sum=project_rewards_sum,
            total_allocated=total_allocated,
            threshold=threshold,
        )
