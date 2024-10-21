from decimal import Decimal
from typing import Annotated
from fastapi import Depends
from pydantic import Field
from pydantic_settings import BaseSettings
from v2.epochs.dependencies import get_epochs_subgraph
from v2.epochs.subgraphs import EpochsSubgraph
from v2.core.dependencies import GetSession, OctantSettings, Web3


from .contracts import PROJECTS_ABI, ProjectsContracts
from .services import (
    EstimatedProjectMatchedRewards,
    EstimatedProjectRewards,
    ProjectsAllocationThresholdGetter,
)


class ProjectsSettings(OctantSettings):
    projects_contract_address: str = Field(
        validation_alias="proposals_contract_address"
    )


def get_projects_settings() -> ProjectsSettings:
    return ProjectsSettings()


def get_projects_contracts(
    w3: Web3, settings: Annotated[ProjectsSettings, Depends(get_projects_settings)]
) -> ProjectsContracts:
    return ProjectsContracts(w3, PROJECTS_ABI, settings.projects_contract_address)


GetProjectsContracts = Annotated[
    ProjectsContracts,
    Depends(get_projects_contracts),
]


class ProjectsAllocationThresholdSettings(OctantSettings):
    project_count_multiplier: int = Field(
        default=1,
        description="The multiplier to the number of projects to calculate the allocation threshold.",
    )


def get_projects_allocation_threshold_settings() -> ProjectsAllocationThresholdSettings:
    return ProjectsAllocationThresholdSettings()

def get_projects_allocation_threshold_getter(
    session: GetSession,
    projects: Annotated[ProjectsContracts, Depends(get_projects_contracts)],
    settings: Annotated[
        ProjectsAllocationThresholdSettings,
        Depends(get_projects_allocation_threshold_settings),
    ],
) -> ProjectsAllocationThresholdGetter:
    return ProjectsAllocationThresholdGetter(
        session, projects, settings.project_count_multiplier
    )


class EstimatedProjectMatchedRewardsSettings(OctantSettings):
    TR_PERCENT: Decimal = Field(
        default=Decimal("0.7"), description="The percentage of the TR rewards."
    )
    IRE_PERCENT: Decimal = Field(
        default=Decimal("0.35"), description="The percentage of the IRE rewards."
    )
    MATCHED_REWARDS_PERCENT: Decimal = Field(
        default=Decimal("0.35"), description="The percentage of the matched rewards."
    )


def get_estimated_project_matched_rewards_settings() -> EstimatedProjectMatchedRewardsSettings:
    return EstimatedProjectMatchedRewardsSettings()


def get_estimated_project_matched_rewards(
    session: GetSession,
    epochs_subgraph: Annotated[EpochsSubgraph, Depends(get_epochs_subgraph)],
    settings: Annotated[
        EstimatedProjectMatchedRewardsSettings,
        Depends(get_estimated_project_matched_rewards_settings),
    ],
) -> EstimatedProjectMatchedRewards:
    return EstimatedProjectMatchedRewards(
        session=session,
        epochs_subgraph=epochs_subgraph,
        tr_percent=settings.TR_PERCENT,
        ire_percent=settings.IRE_PERCENT,
        matched_rewards_percent=settings.MATCHED_REWARDS_PERCENT,
    )


def get_estimated_project_rewards(
    session: GetSession,
    projects: Annotated[ProjectsContracts, Depends(get_projects_contracts)],
    estimated_project_matched_rewards: Annotated[
        EstimatedProjectMatchedRewards, Depends(get_estimated_project_matched_rewards)
    ],
) -> EstimatedProjectRewards:
    return EstimatedProjectRewards(
        session=session,
        projects=projects,
        estimated_matched_rewards=estimated_project_matched_rewards,
    )


GetEstimatedProjectMatchedRewards = Annotated[
    EstimatedProjectMatchedRewards,
    Depends(get_estimated_project_matched_rewards),
]