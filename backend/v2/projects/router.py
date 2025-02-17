from fastapi import APIRouter

from v2.projects.dependencies import (
    GetProjectsDetailsGetter,
    GetProjectsMetadataGetter,
)
from v2.projects.schemas import (
    ProjectsMetadataResponseV1,
    ProjectsDetailsResponseV1,
)

api = APIRouter(prefix="/projects", tags=["Projects"])


@api.get("/details", response_model=ProjectsDetailsResponseV1)
async def get_projects_details_v1(
    projects_details_getter: GetProjectsDetailsGetter,
) -> ProjectsDetailsResponseV1:
    """
    Returns projects details for given epochs and search phrases.

    Args:
        epochs (str): Comma-separated list of epoch numbers.
        search_phrases (str): Comma-separated search phrases to filter projects.
    """
    projects_details = await projects_details_getter.get_by_search_phrase()

    return ProjectsDetailsResponseV1(projects_details=projects_details)


@api.get("/epoch/{epoch_number}", response_model=ProjectsMetadataResponseV1)
async def get_projects_metadata_v1(
    projects_metadata_getter: GetProjectsMetadataGetter,
) -> ProjectsMetadataResponseV1:
    """
    Returns projects metadata for a given epoch: addresses and CID.

    Args:
        epoch (int): The epoch number to fetch metadata for.
    """
    projects_metadata_response = await projects_metadata_getter.get()
    return projects_metadata_response
