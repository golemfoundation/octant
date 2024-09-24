from typing import List

from app.infrastructure.database.models import ProjectsDetails


def get_projects_details_for_epoch(epoch: int) -> List[ProjectsDetails]:
    return ProjectsDetails.query.filter_by(epoch=epoch).all()
