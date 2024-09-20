from app.context.manager import epoch_context
from app.modules.registry import get_services
from app.modules.projects.details.service.projects_details import ProjectsDetailsDTO


def get_projects_details(epoch: int, search_phrase: str):
    context = epoch_context(epoch)
    service = get_services(context.epoch_state).projects_details_service

    filtered_projects: ProjectsDetailsDTO = (
        service.get_projects_details_by_search_phrase(context, search_phrase)
    )
    return [
        {
            "name": project["name"],
            "address": project["address"],
        }
        for project in filtered_projects.projects_details
    ]
