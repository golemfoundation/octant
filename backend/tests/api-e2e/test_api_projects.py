import pytest

from flask import current_app as app
from tests.conftest import Client
from tests.helpers.constants import STARTING_EPOCH


@pytest.mark.api
def test_projects_basics(client: Client, setup_funds):
    projects_epoch1, status_code = client.get_projects(STARTING_EPOCH)
    projects_number_epoch1 = len(projects_epoch1["projectsAddresses"])
    assert projects_number_epoch1 > (STARTING_EPOCH - 1)
    assert projects_epoch1["projectsCid"], "projectsCid is empty"
    assert status_code == 200
    app.logger.debug(f"Projects epoch 1:  {projects_epoch1}")

    # forward time to the beginning of the epoch 2
    client.move_to_next_epoch(STARTING_EPOCH + 1)
    # wait for indexer to catch up
    epoch_no = client.wait_for_sync(STARTING_EPOCH + 1)
    app.logger.debug(f"indexed epoch:  {epoch_no}")

    projects_epoch2, status_code = client.get_projects(STARTING_EPOCH + 1)
    projects_number_epoch2 = len(projects_epoch2["projectsAddresses"])
    assert projects_number_epoch2 > 0
    assert projects_epoch2["projectsCid"], "projectsCid is empty"
    assert status_code == 200
    app.logger.debug(f"Projects epoch 2:  {projects_epoch2}")

    assert (
        projects_number_epoch1 == projects_number_epoch2
    ), "Number of projects is different in two epochs"
