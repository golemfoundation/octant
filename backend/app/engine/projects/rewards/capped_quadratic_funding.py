from dataclasses import field, dataclass
from decimal import Decimal
from typing import List, Dict

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
    AllocationItem,
)
from app.engine.projects.rewards.allocations.quadratic_funding import (
    QuadraticFundingAllocations,
)
from app.engine.projects.rewards.funding_cap.percent import (
    FundingCapPercentCalculator,
    ProjectMatchedRewardsDTO,
)
from app.engine.projects.rewards.leverage.mf_cap_and_uq import MRCapAndUQLeverage


@dataclass
class CappedMatchedRewards:
    projects_allocations: ProjectAllocations
    funding_cap: FundingCapPercentCalculator

    def _calculate_matched_rewards(
        self,
        allocated_by_addr: List[ProjectSumAllocationsDTO],
        total_plain_qf: Decimal,
        payload: ProjectRewardsPayload,
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

    def compute(
        self, payload: ProjectRewardsPayload, allocations: List[AllocationItem]
    ) -> (Dict[str, Decimal], Dict[str, List]):
        (
            grouped_allocations,
            allocated_by_addr,
            total_allocated,
        ) = self.projects_allocations.group_allocations_by_projects(
            ProjectAllocationsPayload(allocations=allocations)
        )

        matched_allocated_by_addr = self._calculate_matched_rewards(
            allocated_by_addr, total_allocated, payload
        )
        capped_matched_by_addr = self.funding_cap.apply_capped_distribution(
            matched_allocated_by_addr, payload.matched_rewards
        )
        return capped_matched_by_addr, grouped_allocations


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
    leverage: MRCapAndUQLeverage = field(default_factory=MRCapAndUQLeverage)
    capped_mr: CappedMatchedRewards = field(init=False)

    def __post_init__(self):
        self.capped_mr = CappedMatchedRewards(
            self.projects_allocations, self.funding_cap
        )

    def _aggregate_rewards(
        self,
        payload: ProjectRewardsPayload,
        capped_matched_by_addr: Dict[str, Decimal],
        grouped_allocations: Dict[str, List],
    ):
        rewards = {
            address: ProjectRewardDTO(address, 0, 0) for address in payload.projects
        }
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

        return rewards, project_rewards_sum, total_allocated

    def calculate_project_rewards(
        self, payload: ProjectRewardsPayload
    ) -> ProjectRewardsResult:
        """
        Calculate rewards for projects using plain quadratic funding formula with capped funding.
        """
        before_capped_matched_by_addr, _ = self.capped_mr.compute(
            payload, payload.before_allocations
        )
        merged_allocations = payload.before_allocations + payload.user_new_allocations
        capped_matched_by_addr, grouped_allocations = self.capped_mr.compute(
            payload, merged_allocations
        )

        rewards, project_rewards_sum, total_allocated = self._aggregate_rewards(
            payload, capped_matched_by_addr, grouped_allocations
        )

        project_addresses = list(
            map(lambda x: x.project_address, payload.user_new_allocations)
        )
        user_new_allocations = sum(
            list(map(lambda x: x.amount, payload.user_new_allocations))
        )

        leverage = self.leverage.calculate_individual_leverage(
            before_capped_matched_by_addr,
            capped_matched_by_addr,
            project_addresses,
            user_new_allocations,
        )

        return ProjectRewardsResult(
            rewards=sorted(rewards.values(), key=lambda r: r.allocated, reverse=True),
            rewards_sum=int(project_rewards_sum),
            total_allocated=int(total_allocated),
            threshold=None,
            leverage=leverage,
        )
