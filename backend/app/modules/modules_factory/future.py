from app.modules.modules_factory.protocols import (
    OctantRewards,
    ProjectsMetadataService
)
from app.modules.octant_rewards.service.calculated import CalculatedOctantRewards
from app.modules.staking.proceeds.service.estimated import EstimatedStakingProceeds
from app.modules.user.deposits.service.contract_balance import (
    ContractBalanceUserDeposits,
)
from app.modules.projects.service.projects_metadata import StaticProjectsMetadataService
from app.pydantic import Model


class FutureServices(Model):
    octant_rewards_service: OctantRewards
    projects_metadata_service: ProjectsMetadataService

    @staticmethod
    def create() -> "FutureServices":
        return FutureServices(
            octant_rewards_service=CalculatedOctantRewards(
                staking_proceeds=EstimatedStakingProceeds(),
                effective_deposits=ContractBalanceUserDeposits(),
            ),
            projects_metadata_service=StaticProjectsMetadataService()
        )
