from app.modules.modules_factory.protocols import (
    OctantRewards,
    ProjectsMetadataService,
    ProjectsDetailsService,
)
from app.modules.octant_rewards.general.service.calculated import (
    CalculatedOctantRewards,
)
from app.modules.projects.details.service.projects_details import (
    StaticProjectsDetailsService,
)
from app.modules.projects.metadata.service.projects_metadata import (
    StaticProjectsMetadataService,
)
from app.modules.staking.proceeds.service.estimated import EstimatedStakingProceeds
from app.modules.user.deposits.service.contract_balance import (
    ContractBalanceUserDeposits,
)
from app.pydantic import Model


class FutureServices(Model):
    octant_rewards_service: OctantRewards
    projects_metadata_service: ProjectsMetadataService
    projects_details_service: ProjectsDetailsService

    @staticmethod
    def create() -> "FutureServices":
        return FutureServices(
            octant_rewards_service=CalculatedOctantRewards(
                staking_proceeds=EstimatedStakingProceeds(),
                effective_deposits=ContractBalanceUserDeposits(),
            ),
            projects_metadata_service=StaticProjectsMetadataService(),
            projects_details_service=StaticProjectsDetailsService(),
        )
