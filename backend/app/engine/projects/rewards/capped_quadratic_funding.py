from dataclasses import field, dataclass
from decimal import Decimal
from typing import Dict

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
from engine.projects.rewards.funding_cap.percent import FundingCapPercentCalculator


@dataclass
class QuadraticFundingProjectRewards(ProjectRewards):
    projects_allocations: ProjectAllocations = field(
        default_factory=QuadraticFundingAllocations
    )
    funding_cap: FundingCapPercentCalculator = field(
        default_factory=lambda: FundingCapPercentCalculator(
            FUNDING_CAP_PERCENT=MR_FUNDING_CAP_PERCENT
        )
    )

    def calculate_project_rewards(
        self, payload: ProjectRewardsPayload
    ) -> ProjectRewardsResult:
        """
        Calculate rewards for projects using plain quadratic funding formula with capped funding.
        """
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

        calc_matched = lambda quadratic_allocated: Decimal(
            quadratic_allocated / Decimal(total_allocated) * payload.matched_rewards
        )
        allocated_by_addr_with_matched: Dict[str, Decimal] = dict(
            map(
                lambda address, qf: (address[0], calc_matched(qf[1])),
                allocated_by_addr.items(),
            )
        )

        capped_allocated_by_addr = self.funding_cap.apply_capped_distribution(
            allocated_by_addr_with_matched, payload.matched_rewards
        )

        for address, capped_quadratic_allocated in capped_allocated_by_addr.items():
            plain_quadratic_allocated = allocated_by_addr[address]

            project_rewards_sum += capped_quadratic_allocated
            project_rewards = rewards[address]
            project_rewards.allocated = int(plain_quadratic_allocated)
            project_rewards.matched = int(
                capped_quadratic_allocated - plain_quadratic_allocated
            )

        return ProjectRewardsResult(
            rewards=sorted(rewards.values(), key=lambda r: r.allocated, reverse=True),
            rewards_sum=int(project_rewards_sum),
            total_allocated=total_allocated,
            threshold=None,
        )
