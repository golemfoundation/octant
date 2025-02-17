from __future__ import annotations

from typing import Annotated

from fastapi import Depends
from pydantic import Field

from app.constants import (
    DEFAULT_MAINNET_PROJECT_CIDS,
    DEFAULT_PROJECTS_CONTRACT_ADDRESS,
)
from v2.core.dependencies import GetSession, OctantSettings, Web3
from v2.core.enums import ChainTypes
from v2.core.logic import compare_blockchain_types
from v2.epochs.dependencies import GetOpenAllocationWindowEpochNumber
from v2.projects.contracts import PROJECTS_ABI, ProjectsContracts
from v2.projects.core import process_search_params
from v2.projects.schemas import EpochsParameter, SearchPhrasesParameter, EpochNumberPath
from v2.projects.services.projects_allocation_threshold_getter import (
    ProjectsAllocationThresholdGetter,
)
from v2.projects.services.projects_details import (
    ProjectsDetailsGetter,
    ProjectsMetadataGetter,
)


class ProjectsSettings(OctantSettings):
    projects_contract_address: str = Field(
        validation_alias="proposals_contract_address",
        default=DEFAULT_PROJECTS_CONTRACT_ADDRESS,
    )
    chain_id: int = Field(
        validation_alias="chain_id",
        default=11155111,
        description="The chain id to use for the signature verification.",
    )
    mainnet_project_cids_raw: str = Field(
        validation_alias="mainnet_proposal_cids", default=DEFAULT_MAINNET_PROJECT_CIDS
    )

    @property
    def mainnet_project_cids(self) -> list[str]:
        return self.mainnet_project_cids_raw.split(",")

    @property
    def is_mainnet(self) -> bool:
        return compare_blockchain_types(self.chain_id, ChainTypes.MAINNET)


class ProjectsAllocationThresholdSettings(OctantSettings):
    project_count_multiplier: int = Field(
        default=1,
        description="The multiplier to the number of projects to calculate the allocation threshold.",
    )


def get_projects_settings() -> ProjectsSettings:
    return ProjectsSettings()  # type: ignore[call-arg]


def get_projects_contracts(
    w3: Web3, settings: Annotated[ProjectsSettings, Depends(get_projects_settings)]
) -> ProjectsContracts:
    return ProjectsContracts(
        w3, PROJECTS_ABI, settings.projects_contract_address
    )  # type: ignore[arg-type]


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


async def get_projects_metadata_getter(
    epoch_number: EpochNumberPath,
    projects_contracts: GetProjectsContracts,
    settings: GetProjectsSettings,
    session: GetSession,
) -> ProjectsMetadataGetter:
    return ProjectsMetadataGetter(
        session=session,
        epoch_number=epoch_number,
        projects_contracts=projects_contracts,
        is_mainnet=settings.is_mainnet,
        mainnet_project_cids=settings.mainnet_project_cids,
    )


async def get_projects_details_getter(
    session: GetSession,
    epochs: EpochsParameter,
    search_phrases_param: SearchPhrasesParameter,
) -> ProjectsDetailsGetter:
    epoch_numbers, search_phrases = process_search_params(epochs, search_phrases_param)
    return ProjectsDetailsGetter(
        session=session, epoch_numbers=epoch_numbers, search_phrases=search_phrases
    )


GetProjectsAllocationThresholdGetter = Annotated[
    ProjectsAllocationThresholdGetter,
    Depends(get_projects_allocation_threshold_getter),
]

GetProjectsContracts = Annotated[
    ProjectsContracts,
    Depends(get_projects_contracts),
]

GetProjectsSettings = Annotated[
    ProjectsSettings,
    Depends(get_projects_settings),
]

GetProjectsMetadataGetter = Annotated[
    ProjectsMetadataGetter,
    Depends(get_projects_metadata_getter),
]

GetProjectsDetailsGetter = Annotated[
    ProjectsDetailsGetter,
    Depends(get_projects_details_getter),
]
