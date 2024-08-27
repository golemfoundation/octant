from pydantic import Field
from pydantic_settings import BaseSettings
from v2.core.dependencies import w3_getter
from web3 import AsyncWeb3

from .contracts import PROJECTS_ABI, ProjectsContracts


class ProjectsSettings(BaseSettings):
    projects_contract_address: str = Field(
        validation_alias="proposals_contract_address"
    )


# TODO: cache
def get_projects(w3: AsyncWeb3, projects_contract_address: str) -> ProjectsContracts:
    return ProjectsContracts(w3, PROJECTS_ABI, projects_contract_address)  # type: ignore


def projects_getter() -> ProjectsContracts:
    settings = ProjectsSettings()  # type: ignore
    return get_projects(w3_getter(), settings.projects_contract_address)
