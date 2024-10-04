import pytest

from app.modules.projects.details.service.projects_details import (
    StaticProjectsDetailsService,
    ProjectsDetailsDTO,
)
from tests.helpers.context import get_context


@pytest.fixture(autouse=True)
def before(app, patch_projects_details):
    pass


@pytest.mark.parametrize("search_phrase", ["Octant", "TEST", "AnyName"])
def test_get_projects_details_by_search_phrase(search_phrase):
    epoch = 4
    context = get_context(epoch)
    service = StaticProjectsDetailsService()
    projects_details: ProjectsDetailsDTO = (
        service.get_projects_details_by_search_phrase(context, search_phrase)
    )

    for project in projects_details.projects_details:
        assert search_phrase.lower() in project["name"].lower()
        assert project["epoch"] == str(epoch)
        assert "address" in project and project["address"] is not None


def test_get_projects_details_by_search_phrase_not_found():
    context = get_context(4)
    service = StaticProjectsDetailsService()
    projects_details: ProjectsDetailsDTO = (
        service.get_projects_details_by_search_phrase(context, "NOT_FOUND")
    )

    assert projects_details.projects_details == []
