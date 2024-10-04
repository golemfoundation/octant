from typing import List

from app.infrastructure.database.models import ProjectsDetails


def sample_projects_details(*args, **kwargs) -> List[ProjectsDetails]:
    return [
        ProjectsDetails(id=1, address="0x111", name="TEST1", epoch=4),
        ProjectsDetails(id=2, address="0x222", name="AnyName2", epoch=4),
        ProjectsDetails(id=3, address="0x333", name="OctantProject3", epoch=4),
        ProjectsDetails(id=4, address="0x444", name="OctantTestProject4", epoch=4),
    ]
