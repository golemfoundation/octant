import pytest

from tests.modules.projects.helpers import sample_projects_details


@pytest.fixture(scope="function")
def patch_projects_details(monkeypatch):
    monkeypatch.setattr(
        "app.modules.projects.details.service.projects_details.get_projects_details_for_epoch",
        sample_projects_details,
    )
