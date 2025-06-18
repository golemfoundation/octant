"""
Project management endpoints for handling project details and metadata.

This module provides endpoints for retrieving project information, including:
1. Project details with search functionality
2. Project metadata for specific epochs

Key Concepts:
    - Project Details:
        - Comprehensive project information
        - Searchable by multiple phrases
        - Filterable by epoch numbers
        - Includes project status and metrics

    - Project Metadata:
        - Basic project identification
        - IPFS content identifiers (CIDs)
        - Epoch-specific information
        - Project addresses

    - Search Functionality:
        - Multiple search phrases
        - Comma-separated input
        - Case-insensitive matching
        - Partial matches supported

    - Epoch Filtering:
        - Multiple epoch support
        - Comma-separated epoch numbers
        - Validates epoch existence
        - Returns epoch-specific data
"""

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

    This endpoint provides comprehensive project information, allowing filtering
    by both epoch numbers and search phrases. The search is performed across
    multiple project attributes.

    Query Parameters:
        - epochs: Comma-separated list of epoch numbers to filter projects
        - search_phrases: Comma-separated list of search phrases to filter projects

    Returns:
        ProjectsDetailsResponseV1 containing:
            - projects_details: List of project details, each including:
                - Project identification
                - Status information
                - Performance metrics
                - Epoch-specific data

    Note:
        - Search is case-insensitive
        - Partial matches are supported
        - Multiple search phrases are combined with OR logic
        - Invalid epoch numbers are ignored
        - Empty search phrases return all projects
    """
    projects_details = await projects_details_getter.get_by_search_phrase()

    return ProjectsDetailsResponseV1(projects_details=projects_details)


@api.get("/epoch/{epoch_number}", response_model=ProjectsMetadataResponseV1)
async def get_projects_metadata_v1(
    projects_metadata_getter: GetProjectsMetadataGetter,
) -> ProjectsMetadataResponseV1:
    """
    Returns projects metadata for a given epoch: addresses and CID.

    This endpoint provides basic project information for a specific epoch,
    including project addresses and their associated IPFS content identifiers.

    Path Parameters:
        - epoch_number: The epoch number to fetch metadata for

    Returns:
        ProjectsMetadataResponseV1 containing:
            - projects_metadata: List of project metadata, each including:
                - Project address
                - IPFS content identifier (CID)
                - Epoch-specific information

    Note:
        - Only returns active projects for the specified epoch
        - CIDs point to project documentation in IPFS
        - Project addresses are Ethereum addresses
        - Returns empty list for non-existent epochs
    """
    projects_metadata_response = await projects_metadata_getter.get()
    return projects_metadata_response
