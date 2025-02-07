import logging
from dataclasses import dataclass

from sqlalchemy.ext.asyncio import AsyncSession

from v2.projects.contracts import ProjectsContracts
from v2.projects.core import filter_projects_details, parse_cids_to_epochs_dict
from v2.projects.repositories import get_projects_details_for_epoch
from v2.projects.schemas import ProjectModel, ProjectsMetadataResponseV1


@dataclass
class ProjectsDetailsGetter:
    # Parameters
    epoch_numbers: list[int]
    search_phrases: list[str]

    # Dependencies
    session: AsyncSession

    async def get_by_search_phrase(self) -> list[ProjectModel]:
        """
        Get projects details filtered by search phrase for a specific epoch context.
        """

        all_filtered_projects_details = []

        for epoch_number in self.epoch_numbers:
            projects_details = await get_projects_details_for_epoch(
                self.session, epoch_number
            )
            for search_phrase in self.search_phrases:
                filtered_projects_details = filter_projects_details(
                    projects_details, search_phrase
                )

                for project_details in filtered_projects_details:
                    project_details_model = ProjectModel(
                        name=project_details.name,
                        address=project_details.address,
                        epoch=project_details.epoch,
                    )

                    if project_details_model in all_filtered_projects_details:
                        continue

                    all_filtered_projects_details.append(project_details_model)

        return all_filtered_projects_details


@dataclass
class ProjectsMetadataGetter:
    # Parameters
    epoch_number: int
    is_mainnet: bool
    mainnet_project_cids: list[str]

    # Dependencies
    session: AsyncSession
    projects_contracts: ProjectsContracts

    async def _get_projects_cid(self) -> str:
        if self.is_mainnet:
            epoch_to_cid_dict = parse_cids_to_epochs_dict(self.mainnet_project_cids)
            projects_cid = (
                await self.projects_contracts.get_project_cid()
                if self.epoch_number not in epoch_to_cid_dict
                else epoch_to_cid_dict[self.epoch_number]
            )
        else:
            projects_cid = await self.projects_contracts.get_project_cid()

        return projects_cid

    async def get(self) -> ProjectsMetadataResponseV1:
        """
        Get projects metadata for a specific epoch.
        """
        logging.debug(f"Getting projects metadata for epoch {self.epoch_number}")

        projects_cid = await self._get_projects_cid()

        logging.debug(f"Projects CID: {projects_cid}")

        projects_address_list = await self.projects_contracts.get_project_addresses(
            self.epoch_number
        )
        logging.debug(f"Projects Address List: {projects_address_list}")

        return ProjectsMetadataResponseV1(
            projects_addresses=projects_address_list, projects_cid=projects_cid
        )
