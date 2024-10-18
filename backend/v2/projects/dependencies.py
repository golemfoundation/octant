from typing import Annotated

from fastapi import Depends
from pydantic import Field
from v2.core.dependencies import GetSession, OctantSettings, Web3
from v2.epochs.dependencies import GetOpenAllocationWindowEpochNumber
from v2.projects.contracts import PROJECTS_ABI, ProjectsContracts
from v2.projects.services import ProjectsAllocationThresholdGetter


class ProjectsSettings(OctantSettings):
    projects_contract_address: str = Field(
        validation_alias="proposals_contract_address"
    )


def get_projects_settings() -> ProjectsSettings:
    return ProjectsSettings()  # type: ignore[call-arg]


def get_projects_contracts(
    w3: Web3, settings: Annotated[ProjectsSettings, Depends(get_projects_settings)]
) -> ProjectsContracts:
    return ProjectsContracts(w3, PROJECTS_ABI, settings.projects_contract_address)  # type: ignore[arg-type]


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
    epoch_number: GetOpenAllocationWindowEpochNumber,
    session: GetSession,
    projects: GetProjectsContracts,
    settings: Annotated[
        ProjectsAllocationThresholdSettings,
        Depends(get_projects_allocation_threshold_settings),
    ],
) -> ProjectsAllocationThresholdGetter:
    return ProjectsAllocationThresholdGetter(
        epoch_number, session, projects, settings.project_count_multiplier
    )
