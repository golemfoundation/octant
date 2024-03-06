from typing import List

from app.extensions import proposals
from app.pydantic import Model


class ProjectsDetails(Model):
    projects: List[str]


def get_projects_details(epoch_num: int) -> ProjectsDetails:
    # TODO replace with the call to the graph https://linear.app/golemfoundation/issue/OCT-1188/add-projects-to-context
    projects = proposals.get_proposal_addresses(epoch_num)
    return ProjectsDetails(projects=projects)
