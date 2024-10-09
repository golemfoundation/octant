from typing import List, Dict

from app.context.manager import epoch_context
from app.modules.registry import get_services
from app.modules.projects.details.service.projects_details import ProjectsDetailsDTO


def get_projects_details_for_multiple_params(
    epochs: List[int], search_phrases: List[str]
) -> List[Dict[str, str]]:
    searched_projects = []
    for epoch in epochs:
        for search_phrase in search_phrases:
            project_details = get_projects_details(epoch, search_phrase)
            searched_projects.extend(project_details)
    return searched_projects


def get_projects_details(epoch: int, search_phrase: str) -> List[Dict[str, str]]:
    context = epoch_context(epoch)

    service = get_services(context.epoch_state).projects_details_service

    filtered_projects: ProjectsDetailsDTO = (
        service.get_projects_details_by_search_phrase(context, search_phrase)
    )
    return [
        {
            "name": project["name"],
            "address": project["address"],
            "epoch": project["epoch"],
        }
        for project in filtered_projects.projects_details
    ]
