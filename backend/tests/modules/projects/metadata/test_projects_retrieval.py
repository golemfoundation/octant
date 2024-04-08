import pytest

from app.modules.dto import ProjectsMetadata
from app.modules.projects.metadata.service.projects_metadata import (
    StaticProjectsMetadataService,
)
from tests.helpers.context import get_context
from tests.conftest import MOCK_PROPOSALS


@pytest.fixture(autouse=True)
def before(app, patch_proposals):
    MOCK_PROPOSALS.get_proposal_addresses.return_value = ["0x0", "0x1"]
    MOCK_PROPOSALS.get_proposals_cid.return_value = (
        "QmXbFKrMGJUbXupmTQsQhoy9zkzXDBHZkPAzKC4yiaLt5n"
    )
    pass


def test_get_projects_metadata_epoch_1():
    context = get_context(1)

    service = StaticProjectsMetadataService()
    projects_metadata: ProjectsMetadata = service.get_projects_metadata(context)

    assert (
        projects_metadata.proposals_cid
        == "QmSQEFD35gKxdPEmngNt1CWe3kSwiiGqBn1Z3FZvWb8mvK"
    )
    assert projects_metadata.projects_addresses == ["0x0", "0x1"]


def test_get_projects_metadata_epoch_2():
    context = get_context(2)

    service = StaticProjectsMetadataService()
    projects_metadata: ProjectsMetadata = service.get_projects_metadata(context)

    assert (
        projects_metadata.proposals_cid
        == "Qmds9N5y2vkMuPTD6M4EBxNXnf3bjTDmzWBGnCkQGsMMGe"
    )
    assert projects_metadata.projects_addresses == ["0x0", "0x1"]


def test_get_projects_metadata_epoch_3():
    context = get_context(3)

    service = StaticProjectsMetadataService()
    projects_metadata: ProjectsMetadata = service.get_projects_metadata(context)

    assert (
        projects_metadata.proposals_cid
        == "QmXbFKrMGJUbXupmTQsQhoy9zkzXDBHZkPAzKC4yiaLt5n"
    )
    assert projects_metadata.projects_addresses == ["0x0", "0x1"]


def test_get_projects_metadata_epoch_100():
    context = get_context(100)

    service = StaticProjectsMetadataService()
    projects_metadata: ProjectsMetadata = service.get_projects_metadata(context)

    assert (
        projects_metadata.proposals_cid
        == "QmXbFKrMGJUbXupmTQsQhoy9zkzXDBHZkPAzKC4yiaLt5n"
    )
