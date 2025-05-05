import pytest
import logging

from tests.conftest import add_user_sync
from tests.helpers.constants import STARTING_EPOCH, LOW_UQ_SCORE, MAX_UQ_SCORE
from tests.api_e2e.conftest import FastAPIClient, FastUserAccount
from sqlalchemy.orm import Session


@pytest.mark.api
@pytest.mark.asyncio
async def test_uq_for_user(
    fclient: FastAPIClient, ua_alice: FastUserAccount, sync_session: Session
):
    await fclient.move_to_next_epoch(STARTING_EPOCH + 1)
    await fclient.move_to_next_epoch(STARTING_EPOCH + 2)
    await fclient.move_to_next_epoch(STARTING_EPOCH + 3)

    epoch_no = fclient.wait_for_sync(STARTING_EPOCH + 3)
    logging.debug(f"indexed epoch: {epoch_no}")

    _, code = fclient.get_user_uq(ua_alice.address, 4)
    USER_NOT_FOUND = 200  # This actually makes sense because we can check score's address that is not user
    assert code == USER_NOT_FOUND

    add_user_sync(sync_session, ua_alice.address)
    sync_session.commit()

    res, code = fclient.get_user_uq(ua_alice.address, 4)
    assert code == 200
    assert res["uniquenessQuotient"] in [str(LOW_UQ_SCORE), str(MAX_UQ_SCORE)]


@pytest.mark.api
@pytest.mark.asyncio
async def test_uq_for_all_users(
    fclient: FastAPIClient,
    ua_alice: FastUserAccount,
    ua_bob: FastUserAccount,
    setup_funds,
):
    await fclient.move_to_next_epoch(STARTING_EPOCH + 1)
    await fclient.move_to_next_epoch(STARTING_EPOCH + 2)
    await fclient.move_to_next_epoch(STARTING_EPOCH + 3)
    await ua_alice.lock(10000)
    await ua_bob.lock(10000)
    await fclient.move_to_next_epoch(STARTING_EPOCH + 4)

    epoch_no = fclient.wait_for_sync(STARTING_EPOCH + 4)
    logging.debug(f"indexed epoch: {epoch_no}")

    res = fclient.pending_snapshot()
    assert res["epoch"] > 0

    # make an allocation during AW since it saves the uq to the database
    projects, _ = ua_alice._client.get_projects(4)
    alice_bob_proposals = projects["projectsAddresses"][:3]

    ua_alice.allocate(1000, alice_bob_proposals)
    ua_bob.allocate(1000, alice_bob_proposals)

    res, code = fclient.get_all_uqs(4)
    assert code == 200
    assert type(res["uqsInfo"]) is list
    assert len(res["uqsInfo"]) == 2

    assert res["uqsInfo"][0]["userAddress"] == ua_alice.address
    assert res["uqsInfo"][1]["userAddress"] == ua_bob.address
