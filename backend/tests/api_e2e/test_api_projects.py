import pytest
import logging
from tests.helpers.constants import STARTING_EPOCH
from tests.api_e2e.conftest import FastAPIClient


@pytest.mark.api
@pytest.mark.asyncio
async def test_projects_basics(fclient: FastAPIClient, setup_funds):
    projects_epoch1, status_code = fclient.get_projects(STARTING_EPOCH)
    projects_number_epoch1 = len(projects_epoch1["projectsAddresses"])
    assert projects_number_epoch1 > (STARTING_EPOCH - 1)
    assert projects_epoch1["projectsCid"], "projectsCid is empty"
    assert status_code == 200
    logging.debug(f"Projects epoch 1:  {projects_epoch1}")

    # forward time to the beginning of the epoch 2
    await fclient.move_to_next_epoch(STARTING_EPOCH + 1)
    # wait for indexer to catch up
    epoch_no = fclient.wait_for_sync(STARTING_EPOCH + 1)
    logging.debug(f"indexed epoch:  {epoch_no}")

    projects_epoch2, status_code = fclient.get_projects(STARTING_EPOCH + 1)
    projects_number_epoch2 = len(projects_epoch2["projectsAddresses"])
    assert projects_number_epoch2 > 0
    assert projects_epoch2["projectsCid"], "projectsCid is empty"
    assert status_code == 200
    logging.debug(f"Projects epoch 2:  {projects_epoch2}")

    assert (
        projects_number_epoch1 == projects_number_epoch2
    ), "Number of projects is different in two epochs"
