from typing import List

from app.extensions import projects as projects_extension
from app.pydantic import Model


class ProjectsDetails(Model):
    projects: List[str]


def get_projects_details(epoch_num: int) -> ProjectsDetails:
    # TODO replace with the call to the graph https://linear.app/golemfoundation/issue/OCT-1188/add-projects-to-context
    projects = projects_extension.get_project_addresses(epoch_num)
    return ProjectsDetails(projects=projects)
