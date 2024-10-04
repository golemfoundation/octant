from typing import List

from app.infrastructure.database.models import ProjectsDetails


def filter_projects_details(
    projects_details: List[ProjectsDetails], search_phrase: str
) -> List[ProjectsDetails]:
    search_phrase = search_phrase.strip().lower()

    filtered_project_details = []

    for project_details in projects_details:
        if (
            search_phrase in project_details.name.lower()
            or search_phrase in project_details.address.lower()
        ):
            filtered_project_details.append(project_details)

    return filtered_project_details
