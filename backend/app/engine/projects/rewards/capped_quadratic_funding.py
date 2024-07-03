from dataclasses import field, dataclass
from decimal import Decimal
from typing import List

from app.constants import MR_FUNDING_CAP_PERCENT
from app.engine.projects import ProjectRewards
from app.engine.projects.rewards import (
    ProjectRewardsPayload,
    ProjectRewardsResult,
    ProjectRewardDTO,
)
from app.engine.projects.rewards.allocations import (
    ProjectAllocations,
    ProjectAllocationsPayload,
    ProjectSumAllocationsDTO,
)
from app.engine.projects.rewards.allocations.quadratic_funding import (
    QuadraticFundingAllocations,
)
from app.engine.projects.rewards.funding_cap.percent import (
    FundingCapPercentCalculator,
    ProjectMatchedRewardsDTO,
)


@dataclass
class CappedQuadraticFundingProjectRewards(ProjectRewards):
    projects_allocations: ProjectAllocations = field(
        default_factory=QuadraticFundingAllocations
    )
    funding_cap: FundingCapPercentCalculator = field(
        default_factory=lambda: FundingCapPercentCalculator(
            FUNDING_CAP_PERCENT=MR_FUNDING_CAP_PERCENT
        )
    )

    def _calculate_matched_rewards(
        self,
        allocated_by_addr: List[ProjectSumAllocationsDTO],
        total_plain_qf: Decimal,
        payload,
    ) -> List[ProjectMatchedRewardsDTO]:
        allocated_by_addr_with_matched = []
        for allocation in allocated_by_addr:
            if total_plain_qf == 0:
                calc_matched = Decimal(0)
            else:
                calc_matched = Decimal(
                    allocation.amount / total_plain_qf * payload.matched_rewards
                )

            allocated_by_addr_with_matched.append(
                ProjectMatchedRewardsDTO(allocation.project_address, calc_matched)
            )

        return allocated_by_addr_with_matched

    def calculate_project_rewards(
        self, payload: ProjectRewardsPayload
    ) -> ProjectRewardsResult:
        """
        Calculate rewards for projects using plain quadratic funding formula with capped funding.
        """
        (
            grouped_allocations,
            plain_qf_by_addr,
            total_plain_qf,
        ) = self.projects_allocations.group_allocations_by_projects(
            ProjectAllocationsPayload(allocations=payload.allocations)
        )
        rewards = {
            address: ProjectRewardDTO(address, 0, 0) for address in payload.projects
        }

        matched_allocated_by_addr = self._calculate_matched_rewards(
            plain_qf_by_addr, total_plain_qf, payload
        )
        capped_matched_by_addr = self.funding_cap.apply_capped_distribution(
            matched_allocated_by_addr, payload.matched_rewards
        )

        project_rewards_sum = 0
        total_allocated = 0
        for address, capped_matched in capped_matched_by_addr.items():
            project_allocations = grouped_allocations[address]
            plain_allocation = sum(
                project_allocation.amount for project_allocation in project_allocations
            )

            project_rewards_sum += plain_allocation + capped_matched
            project_rewards = rewards[address]
            project_rewards.allocated = int(plain_allocation)
            project_rewards.matched = int(capped_matched)

            total_allocated += plain_allocation

        return ProjectRewardsResult(
            rewards=sorted(rewards.values(), key=lambda r: r.allocated, reverse=True),
            rewards_sum=int(project_rewards_sum),
            total_allocated=int(total_allocated),
            threshold=None,
        )
