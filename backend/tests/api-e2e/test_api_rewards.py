import pytest

from flask import current_app as app
from app.legacy.core.projects import get_projects_addresses
from tests.conftest import Client, UserAccount
from tests.helpers.constants import STARTING_EPOCH


@pytest.mark.api
def test_rewards_basic(
    client: Client,
    deployer: UserAccount,
    ua_alice: UserAccount,
    ua_bob: UserAccount,
    setup_funds,
):
    alice_proposals = get_projects_addresses(1)[:3]

    # lock GLM from two accounts
    ua_alice.lock(10000)
    ua_bob.lock(15000)

    # forward time to the beginning of the epoch 2
    client.move_to_next_epoch(STARTING_EPOCH + 1)

    # wait for indexer to catch up
    epoch_no = client.wait_for_sync(STARTING_EPOCH + 1)
    app.logger.debug(f"indexed epoch: {epoch_no}")

    # make a snapshot
    res = client.pending_snapshot()
    assert res["epoch"] > 0

    # check if both users have a budget
    res = client.get_user_rewards_in_epoch(address=ua_alice.address, epoch=STARTING_EPOCH)
    alice_budget = int(res["budget"])
    assert alice_budget > 0

    res = client.get_user_rewards_in_epoch(address=ua_bob.address, epoch=STARTING_EPOCH)
    bob_budget = int(res["budget"])
    assert bob_budget > 0

    # forward time to the beginning of the epoch 3
    client.move_to_next_epoch(STARTING_EPOCH + 2)
    epoch_no = client.wait_for_sync(STARTING_EPOCH + 2)
    app.logger.debug(f"indexed epoch: {epoch_no}")

    # make a pending snapshot
    res = client.pending_snapshot()
    assert res["epoch"] > 1

    # make a finalized snapshot
    res = client.finalized_snapshot()
    assert res["epoch"] == STARTING_EPOCH

    # check if both users will have budget in next epoch
    res = client.get_user_rewards_in_upcoming_epoch(address=ua_alice.address)
    alice_upcoming_budget = int(res["upcomingBudget"])
    assert alice_upcoming_budget > 0

    res = client.get_user_rewards_in_upcoming_epoch(address=ua_bob.address)
    bob_upcoming_budget = int(res["upcomingBudget"])
    assert bob_upcoming_budget > 0
    assert bob_upcoming_budget > alice_upcoming_budget

    # forward time to the beginning of the epoch 2
    client.move_to_next_epoch(STARTING_EPOCH + 2)

    # check epoch budgets contain previously upcoming budgets values
    res = client.get_total_users_rewards_in_epoch(epoch=STARTING_EPOCH)
    assert res.__contains__(str(alice_upcoming_budget))
    assert res.__contains__(str(bob_upcoming_budget))

    # wait for indexer to catch up
    epoch_no = client.wait_for_sync(STARTING_EPOCH + 1)
    app.logger.debug(f"indexed epoch: {epoch_no}")

    # make a snapshot
    res = client.pending_snapshot()
    assert res["epoch"] > 0

    # ua_alice.allocate(1000, alice_proposals)
    # ua_bob.allocate(1000, alice_proposals[:1])
    #
    # allocations, _ = client.get_epoch_allocations(STARTING_EPOCH)
    # unique_donors = set()
    # unique_proposals = set()
    # app.logger.debug(f"Allocations: \n {allocations}")
    #
    # assert len(allocations["allocations"]) == 4
    # for allocation in allocations["allocations"]:
    #     unique_donors.add(allocation["donor"])
    #     unique_proposals.add(allocation["project"])
    #     assert int(allocation["amount"]) > 0
    # app.logger.debug(f"Allocations: {allocations}")
    # assert len(unique_donors) == 2
    # assert len(unique_proposals) == 3


@pytest.mark.api
def test_allocations_basics(
    client: Client,
    deployer: UserAccount,
    ua_alice: UserAccount,
    ua_bob: UserAccount,
    setup_funds,
):
    alice_proposals = get_projects_addresses(1)[:3]

    # lock GLM from one account
    ua_alice.lock(10000)

    # forward time to the beginning of the epoch 2
    client.move_to_next_epoch(STARTING_EPOCH + 1)

    # wait for indexer to catch up
    epoch_no = client.wait_for_sync(STARTING_EPOCH + 1)
    app.logger.debug(f"indexed epoch: {epoch_no}")

    # make a snapshot
    res = client.pending_snapshot()
    assert res["epoch"] > (STARTING_EPOCH - 1)

    # Making allocations
    nonce, status_code = client.get_allocation_nonce(ua_alice.address)
    # Nonce is always 0
    assert status_code == 200, "Nonce status code is different than 200"

    allocation_amount = 1000
    allocation_response_code = ua_alice.allocate(allocation_amount, alice_proposals)
    assert (
        allocation_response_code == 201
    ), "Allocation status code is different than 201"

    epoch_allocations, status_code = client.get_epoch_allocations(STARTING_EPOCH)
    assert len(epoch_allocations["allocations"]) == len(alice_proposals)

    for allocation in epoch_allocations["allocations"]:
        assert allocation["donor"] == ua_alice.address, "Donor address is wrong"
        assert int(allocation["amount"]) == allocation_amount
        assert allocation["project"], "Proposal address is empty"
    app.logger.debug(f"Allocations in epoch 1: {epoch_allocations}")

    assert status_code == 200, "Status code is different than 200"

    # Check user donations
    user_allocations, status_code = client.get_user_allocations(
        STARTING_EPOCH, ua_alice.address
    )
    app.logger.debug(f"User allocations:  {user_allocations}")
    assert user_allocations["allocations"], "User allocations for given epoch are empty"
    assert status_code == 200, "Status code is different than 200"

    # Check donors
    donors, status_code = client.get_donors(STARTING_EPOCH)
    app.logger.debug(f"Donors: {donors}")
    for donor in donors["donors"]:
        assert donor == ua_alice.address, "Donor address is wrong"
    assert status_code == 200, "Status code is different than 200"

    proposal_address = alice_proposals[0]
    # Check donors of particular proposal
    proposal_donors, status_code = client.get_proposal_donors(
        STARTING_EPOCH, proposal_address
    )
    app.logger.debug(f"Proposal donors: {proposal_donors}")
    for proposal_donor in proposal_donors:
        assert (
            proposal_donor["address"] == ua_alice.address
        ), "Proposal donor address is wrong"
    assert status_code == 200, "Status code is different than 200"

    # Check leverage
    leverage, status_code = client.check_leverage(
        proposal_address, ua_alice.address, 1000
    )
    app.logger.debug(f"Leverage: \n{leverage}")

    for matched in leverage["matched"]:
        if matched["address"] == proposal_address:
            assert matched["value"], "Leverage value is empty"

    assert status_code == 200, "Status code is different than 200"
