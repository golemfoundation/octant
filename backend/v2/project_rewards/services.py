import asyncio
from dataclasses import dataclass

from sqlalchemy.ext.asyncio import AsyncSession
from v2.allocations.repositories import get_allocations_with_user_uqs
from v2.matched_rewards.services import MatchedRewardsEstimator
from v2.project_rewards.capped_quadriatic import (
    CappedQuadriaticFunding,
    capped_quadriatic_funding,
)
from v2.projects.contracts import ProjectsContracts


@dataclass
class ProjectRewardsEstimator:
    # Dependencies
    session: AsyncSession
    projects_contracts: ProjectsContracts
    matched_rewards_estimator: MatchedRewardsEstimator

    # Parameters
    epoch_number: int

    async def get(self) -> CappedQuadriaticFunding:
        # Gather all the necessary data for the calculation
        all_projects, matched_rewards, allocations = await asyncio.gather(
            self.projects_contracts.get_project_addresses(self.epoch_number),
            self.matched_rewards_estimator.get(),
            get_allocations_with_user_uqs(self.session, self.epoch_number),
        )

        # Calculate using the Capped Quadriatic Funding formula
        return capped_quadriatic_funding(
            project_addresses=all_projects,
            allocations=allocations,
            matched_rewards=matched_rewards,
        )
