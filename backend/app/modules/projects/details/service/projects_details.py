from dataclasses import dataclass
from typing import List, Dict

from app.pydantic import Model
from app.context.manager import Context
from app.infrastructure.database.projects_details import get_projects_details_for_epoch
from app.modules.projects.details.core import filter_projects_details


@dataclass
class ProjectsDetailsDTO:
    projects_details: List[Dict[str, str]]


class StaticProjectsDetailsService(Model):
    def get_projects_details_by_search_phrase(
        self, context: Context, search_phrase: str
    ) -> ProjectsDetailsDTO:
        epoch = context.epoch_details.epoch_num

        projects_details = get_projects_details_for_epoch(epoch)

        filtered_projects_details = filter_projects_details(
            projects_details, search_phrase
        )

        return ProjectsDetailsDTO(
            projects_details=[
                {"name": project.name, "address": project.address, "epoch": str(epoch)}
                for project in filtered_projects_details
            ]
        )
