import logging
from fastapi.testclient import TestClient
import pytest
from fastapi import status
from tests.api_e2e.conftest import FastUserAccount
from tests.conftest import Client
from tests.helpers.constants import STARTING_EPOCH, LOW_UQ_SCORE


@pytest.mark.api
@pytest.mark.asyncio
async def test_allocations(
    client: Client,
    fastapi_client: TestClient,
    deployer: FastUserAccount,
    ua_alice: FastUserAccount,
    ua_bob: FastUserAccount,
    setup_funds,
):
    projects, _ = ua_alice._client.get_projects(1)
    alice_proposals = projects["projectsAddresses"][:3]

    # lock GLM from two accounts
    ua_alice.lock(10000)
    ua_bob.lock(15000)

    # forward time to the beginning of the epoch 2
    client.move_to_next_epoch(STARTING_EPOCH + 1)

    # wait for indexer to catch up
    epoch_no = client.wait_for_sync(STARTING_EPOCH + 1)
    logging.info(f"indexed epoch: {epoch_no}")

    # make a snapshot
    res = client.pending_snapshot()
    assert res["epoch"] > 0

    # Alice makes an allocation
    ua_alice_nonce, _ = ua_alice._client.get_allocation_nonce(ua_alice.address)
    signature = ua_alice._client.sign_operation(
        ua_alice._account, 1000, alice_proposals, ua_alice_nonce
    )
    rv = fastapi_client.post(
        "/allocations/allocate",
        json={
            "payload": {
                "allocations": [
                    {"proposalAddress": address, "amount": 1000}
                    for address in alice_proposals
                ],
                "nonce": ua_alice_nonce,
            },
            "userAddress": ua_alice.address,
            "signature": signature,
            "isManuallyEdited": False,
        },
    )
    assert rv.status_code == status.HTTP_201_CREATED

    # ua_alice.allocate(1000, alice_proposals)
    ua_bob.allocate(1000, alice_proposals[:1])

    # Check allocations using Flask API
    allocations, _ = client.get_epoch_allocations(STARTING_EPOCH)
    unique_donors = set()
    unique_proposals = set()
    logging.info(f"Allocations: \n {allocations}")

    assert len(allocations["allocations"]) == 4
    for allocation in allocations["allocations"]:
        unique_donors.add(allocation["donor"])
        unique_proposals.add(allocation["project"])
        assert int(allocation["amount"]) > 0
    logging.info(f"Allocations: {allocations}")
    assert len(unique_donors) == 2
    assert len(unique_proposals) == 3

    # Check allocations using FastAPI
    resp = fastapi_client.get(f"/allocations/epoch/{STARTING_EPOCH}")
    assert resp.status_code == status.HTTP_200_OK

    fastapi_allocations = resp.json()
    fastapi_unique_donors = set()
    fastapi_unique_proposals = set()
    logging.debug(f"FastAPI allocations: \n {fastapi_allocations}")

    assert len(fastapi_allocations["allocations"]) == 4
    for allocation in fastapi_allocations["allocations"]:
        fastapi_unique_donors.add(allocation["donor"])
        fastapi_unique_proposals.add(allocation["project"])
        assert int(allocation["amount"]) > 0
    assert len(fastapi_unique_donors) == 2
    assert len(fastapi_unique_proposals) == 3

    # 1:1 API check - Flask and FastAPI allocations are the same
    assert unique_donors == fastapi_unique_donors
    assert unique_proposals == fastapi_unique_proposals


def _check_allocations_logic(
    client: Client,
    ua_alice: FastUserAccount,
    target_pending_epoch: int,
    fastapi_client: TestClient,
):
    projects, _ = ua_alice._client.get_projects(1)
    alice_proposals = projects["projectsAddresses"][:3]

    i = 0
    for i in range(0, target_pending_epoch + 1):
        if i > 0:
            client.move_to_next_epoch(STARTING_EPOCH + i)

        if STARTING_EPOCH + i == target_pending_epoch:
            ua_alice.lock(10000)

    # wait for indexer to catch up
    epoch_no = client.wait_for_sync(STARTING_EPOCH + i)
    logging.debug(f"indexed epoch: {epoch_no}")

    # make a snapshot
    res = client.pending_snapshot()
    assert res["epoch"] > (STARTING_EPOCH - 1)

    # Making allocations
    nonce, status_code = client.get_allocation_nonce(ua_alice.address)
    # Nonce is always 0
    assert status_code == status.HTTP_200_OK, "Nonce status code is different than 200"

    # 1:1 API check - Flask and FastAPI nonce are the same
    resp = fastapi_client.get(f"/allocations/users/{ua_alice.address}/allocation_nonce")
    assert resp.status_code == status.HTTP_200_OK
    assert resp.json() == {
        "allocationNonce": nonce
    }, "Flask and FastAPI nonce are different"

    allocation_amount = "1000"
    allocation_response_code = ua_alice.allocate(allocation_amount, alice_proposals)
    assert (
        allocation_response_code == status.HTTP_201_CREATED
    ), "Allocation status code is different than 201"

    epoch_allocations, status_code = client.get_epoch_allocations(target_pending_epoch)
    assert len(epoch_allocations["allocations"]) == len(alice_proposals)

    for allocation in epoch_allocations["allocations"]:
        assert allocation["donor"] == ua_alice.address, "Donor address is wrong"
        assert int(allocation["amount"]) == allocation_amount
        assert allocation["project"], "Proposal address is empty"
    logging.debug(f"Allocations in epoch 1: {epoch_allocations}")

    assert status_code == status.HTTP_200_OK, "Status code is different than 200"

    # 1:1 API check - Flask and FastAPI allocations are the same
    resp = fastapi_client.get(f"/allocations/epoch/{target_pending_epoch}")
    assert resp.status_code == status.HTTP_200_OK
    fastapi_epoch_allocations = resp.json()
    assert len(fastapi_epoch_allocations["allocations"]) == len(alice_proposals)
    for allocation in fastapi_epoch_allocations["allocations"]:
        assert allocation["donor"] == ua_alice.address, "Donor address is wrong"
        assert int(allocation["amount"]) == allocation_amount
        assert allocation["project"], "Proposal address is empty"

    assert resp.status_code == status.HTTP_200_OK

    # Check user donations
    user_allocations, status_code = client.get_user_allocations(
        target_pending_epoch, ua_alice.address
    )
    logging.debug(f"User allocations:  {user_allocations}")
    assert user_allocations["allocations"], "User allocations for given epoch are empty"
    assert status_code == status.HTTP_200_OK, "Status code is different than 200"

    # 1:1 API check - Flask and FastAPI user allocations are the same
    resp = fastapi_client.get(
        f"/allocations/user/{ua_alice.address}/epoch/{target_pending_epoch}"
    )
    assert resp.status_code == status.HTTP_200_OK
    fastapi_user_allocations = resp.json()
    assert len(fastapi_user_allocations["allocations"]) == len(alice_proposals)
    for allocation in fastapi_user_allocations["allocations"]:
        assert allocation["address"] in alice_proposals
        assert allocation["amount"] == str(allocation_amount)

    # Check donors
    donors, status_code = client.get_donors(target_pending_epoch)
    logging.debug(f"Donors: {donors}")
    for donor in donors["donors"]:
        assert donor == ua_alice.address, "Donor address is wrong"
    assert status_code == 200, "Status code is different than 200"

    # 1:1 API check - Flask and FastAPI donors are the same
    resp = fastapi_client.get(f"/allocations/donors/{target_pending_epoch}")
    assert resp.status_code == status.HTTP_200_OK
    fastapi_donors = resp.json()
    assert len(fastapi_donors["donors"]) == 1
    assert fastapi_donors["donors"][0] == ua_alice.address

    proposal_address = alice_proposals[0]
    # Check donors of particular proposal
    proposal_donors, status_code = client.get_proposal_donors(
        target_pending_epoch, proposal_address
    )
    logging.debug(f"Proposal donors: {proposal_donors}")
    for proposal_donor in proposal_donors:
        assert (
            proposal_donor["address"] == ua_alice.address
        ), "Proposal donor address is wrong"
    assert status_code == 200, "Status code is different than 200"

    # 1:1 API check - Flask and FastAPI proposal donors are the same
    resp = fastapi_client.get(
        f"/allocations/project/{proposal_address}/epoch/{target_pending_epoch}"
    )
    assert resp.status_code == status.HTTP_200_OK
    fastapi_proposal_donors = resp.json()
    assert len(fastapi_proposal_donors) == 1
    assert fastapi_proposal_donors[0]["address"] == ua_alice.address
    assert fastapi_proposal_donors[0]["amount"] == str(allocation_amount)

    # Check leverage
    leverage, status_code = client.check_leverage(
        proposal_address, ua_alice.address, 1000
    )
    logging.debug(f"Leverage: \n{leverage}")

    for matched in leverage["matched"]:
        if matched["address"] == proposal_address:
            assert matched["value"], "Leverage value is empty"

    assert status_code == 200, "Status code is different than 200"


@pytest.mark.api
def test_allocations_basics(
    client: Client,
    fastapi_client: TestClient,
    deployer: FastUserAccount,
    ua_alice: FastUserAccount,
    ua_bob: FastUserAccount,
    setup_funds,
):
    _check_allocations_logic(
        client, ua_alice, target_pending_epoch=1, fastapi_client=fastapi_client
    )


@pytest.mark.api
def test_qf_and_uq_allocations(
    client: Client,
    fastapi_client: TestClient,
    ua_alice: FastUserAccount,
):
    """
    Test for QF and UQ allocations.
    This test checks if we use the QF alongside with UQ functionality properly.
    Introduced in E4.
    """
    PENDING_EPOCH = STARTING_EPOCH + 3

    _check_allocations_logic(
        client,
        ua_alice,
        target_pending_epoch=PENDING_EPOCH,
        fastapi_client=fastapi_client,
    )

    # Check if UQ is saved in the database after the allocation properly
    res, code = client.get_user_uq(ua_alice.address, 4)
    assert code == 200
    assert res["uniquenessQuotient"] == str(LOW_UQ_SCORE)
