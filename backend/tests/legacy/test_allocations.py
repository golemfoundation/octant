import dataclasses

import pytest

from app import exceptions
from app.extensions import db
from app.infrastructure import database
from app.legacy.controllers.allocations import (
    get_all_by_user_and_epoch,
    get_all_by_proposal_and_epoch,
    get_allocation_nonce,
    get_all_by_epoch,
    get_sum_by_epoch,
    allocate,
)
from app.legacy.core.allocations import (
    AllocationRequest,
    Allocation,
)
from app.legacy.core.user.patron_mode import toggle_patron_mode
from app.legacy.crypto.eip712 import sign, build_allocations_eip712_data
from tests.conftest import (
    create_payload,
    deserialize_allocations,
    mock_graphql,
    MOCKED_PENDING_EPOCH_NO,
    MOCK_PROPOSALS,
    MOCK_EPOCHS,
    MOCK_GET_USER_BUDGET,
)
from tests.helpers import create_epoch_event


@pytest.fixture(scope="function")
def get_all_by_epoch_expected_result(user_accounts, proposal_accounts):
    return [
        {
            "donor": user_accounts[0].address,
            "proposal": proposal_accounts[0].address,
            "amount": str(10 * 10**18),
        },
        {
            "donor": user_accounts[0].address,
            "proposal": proposal_accounts[1].address,
            "amount": str(5 * 10**18),
        },
        {
            "donor": user_accounts[0].address,
            "proposal": proposal_accounts[2].address,
            "amount": str(300 * 10**18),
        },
        {
            "donor": user_accounts[1].address,
            "proposal": proposal_accounts[1].address,
            "amount": str(1050 * 10**18),
        },
        {
            "donor": user_accounts[1].address,
            "proposal": proposal_accounts[3].address,
            "amount": str(500 * 10**18),
        },
    ]


@pytest.fixture(autouse=True)
def before(
    app,
    mocker,
    graphql_client,
    proposal_accounts,
    patch_epochs,
    patch_proposals,
    patch_has_pending_epoch_snapshot,
    patch_user_budget,
):
    MOCK_PROPOSALS.get_proposal_addresses.return_value = [
        p.address for p in proposal_accounts[0:5]
    ]

    mock_graphql(
        mocker, epochs_events=[create_epoch_event(epoch=MOCKED_PENDING_EPOCH_NO)]
    )


def test_user_allocates_for_the_first_time(tos_users, proposal_accounts):
    # Test data
    payload = create_payload(proposal_accounts[0:2], None)
    signature = sign(tos_users[0], build_allocations_eip712_data(payload))

    # Call allocate method
    allocate(AllocationRequest(payload, signature, override_existing_allocations=True))

    # Check if allocations were created
    check_allocations(tos_users[0].address, payload, 2)

    # Check if threshold is properly calculated
    check_allocation_threshold(payload)


def test_multiple_users_allocate_for_the_first_time(tos_users, proposal_accounts):
    # Test data
    payload1 = create_payload(proposal_accounts[0:2], None)
    signature1 = sign(tos_users[0], build_allocations_eip712_data(payload1))

    payload2 = create_payload(proposal_accounts[0:3], None)
    signature2 = sign(tos_users[1], build_allocations_eip712_data(payload2))

    # Call allocate method for both users
    allocate(
        AllocationRequest(payload1, signature1, override_existing_allocations=True)
    )
    allocate(
        AllocationRequest(payload2, signature2, override_existing_allocations=True)
    )

    # Check if allocations were created for both users
    check_allocations(tos_users[0].address, payload1, 2)
    check_allocations(tos_users[1].address, payload2, 3)

    # Check if threshold is properly calculated
    check_allocation_threshold(payload1, payload2)


def test_allocate_updates_with_more_proposals(tos_users, proposal_accounts):
    # Test data
    initial_payload = create_payload(proposal_accounts[0:2], None, 0)
    initial_signature = sign(
        tos_users[0], build_allocations_eip712_data(initial_payload)
    )

    # Call allocate method
    allocate(
        AllocationRequest(
            initial_payload, initial_signature, override_existing_allocations=True
        )
    )

    # Create a new payload with more proposals
    updated_payload = create_payload(proposal_accounts[0:3], None, 1)
    updated_signature = sign(
        tos_users[0], build_allocations_eip712_data(updated_payload)
    )

    # Call allocate method with updated_payload
    allocate(
        AllocationRequest(
            updated_payload, updated_signature, override_existing_allocations=True
        )
    )

    # Check if allocations were updated
    check_allocations(tos_users[0].address, updated_payload, 3)

    # Check if threshold is properly calculated
    check_allocation_threshold(updated_payload)


def test_allocate_updates_with_less_proposals(tos_users, proposal_accounts):
    # Test data
    initial_payload = create_payload(proposal_accounts[0:3], None, 0)
    initial_signature = sign(
        tos_users[0], build_allocations_eip712_data(initial_payload)
    )

    # Call allocate method
    allocate(
        AllocationRequest(
            initial_payload, initial_signature, override_existing_allocations=True
        )
    )

    # Create a new payload with fewer proposals
    updated_payload = create_payload(proposal_accounts[0:2], None, 1)
    updated_signature = sign(
        tos_users[0], build_allocations_eip712_data(updated_payload)
    )

    # Call allocate method with updated_payload
    allocate(
        AllocationRequest(
            updated_payload, updated_signature, override_existing_allocations=True
        )
    )

    # Check if allocations were updated
    check_allocations(tos_users[0].address, updated_payload, 2)

    # Check if threshold is properly calculated
    check_allocation_threshold(updated_payload)


def test_multiple_users_change_their_allocations(tos_users, proposal_accounts):
    # Create initial payloads and signatures for both users
    initial_payload1 = create_payload(proposal_accounts[0:2], None, 0)
    initial_signature1 = sign(
        tos_users[0], build_allocations_eip712_data(initial_payload1)
    )
    initial_payload2 = create_payload(proposal_accounts[0:3], None, 0)
    initial_signature2 = sign(
        tos_users[1], build_allocations_eip712_data(initial_payload2)
    )

    # Call allocate method with initial payloads for both users
    allocate(
        AllocationRequest(
            initial_payload1, initial_signature1, override_existing_allocations=True
        )
    )
    allocate(
        AllocationRequest(
            initial_payload2, initial_signature2, override_existing_allocations=True
        )
    )

    # Create updated payloads for both users
    updated_payload1 = create_payload(proposal_accounts[0:4], None, 1)
    updated_signature1 = sign(
        tos_users[0], build_allocations_eip712_data(updated_payload1)
    )
    updated_payload2 = create_payload(proposal_accounts[2:5], None, 1)
    updated_signature2 = sign(
        tos_users[1], build_allocations_eip712_data(updated_payload2)
    )

    # Call allocate method with updated payloads for both users
    allocate(
        AllocationRequest(
            updated_payload1, updated_signature1, override_existing_allocations=True
        )
    )
    allocate(
        AllocationRequest(
            updated_payload2, updated_signature2, override_existing_allocations=True
        )
    )

    # Check if allocations were updated for both users
    check_allocations(tos_users[0].address, updated_payload1, 4)
    check_allocations(tos_users[1].address, updated_payload2, 3)

    # Check if threshold is properly calculated
    check_allocation_threshold(updated_payload1, updated_payload2)


def test_allocation_validation_errors(proposal_accounts, user_accounts, tos_users):
    # Test data
    payload = create_payload(proposal_accounts[0:3], None)
    signature = sign(user_accounts[0], build_allocations_eip712_data(payload))

    # Set invalid number of proposals on purpose (two proposals while three are needed)
    MOCK_PROPOSALS.get_proposal_addresses.return_value = [
        p.address for p in proposal_accounts[0:2]
    ]

    # Set invalid epoch on purpose (mimicking no pending epoch)
    MOCK_EPOCHS.get_pending_epoch.return_value = None

    # Call allocate method, expect exception
    with pytest.raises(exceptions.NotInDecisionWindow):
        allocate(
            AllocationRequest(payload, signature, override_existing_allocations=True)
        )

    # Fix pending epoch
    MOCK_EPOCHS.get_pending_epoch.return_value = MOCKED_PENDING_EPOCH_NO

    # Call allocate method, expect invalid proposals
    with pytest.raises(exceptions.InvalidProposals):
        allocate(
            AllocationRequest(payload, signature, override_existing_allocations=True)
        )

    # Fix missing proposals
    MOCK_PROPOSALS.get_proposal_addresses.return_value = [
        p.address for p in proposal_accounts[0:3]
    ]

    # Expect no validation errors at this point
    allocate(AllocationRequest(payload, signature, override_existing_allocations=True))


def test_project_allocates_funds_to_itself(proposal_accounts):
    # Test data
    database.user.get_or_add_user(proposal_accounts[0].address)
    payload = create_payload(proposal_accounts[0:3], None)
    signature = sign(proposal_accounts[0], build_allocations_eip712_data(payload))

    with pytest.raises(exceptions.ProposalAllocateToItself):
        allocate(
            AllocationRequest(payload, signature, override_existing_allocations=True)
        )


def test_allocate_by_user_in_patron_mode(tos_users, proposal_accounts):
    # Test data
    initial_payload = create_payload(proposal_accounts[0:3], None, 0)
    initial_signature = sign(
        tos_users[0], build_allocations_eip712_data(initial_payload)
    )
    toggle_patron_mode(tos_users[0].address)

    # Call allocate method
    with pytest.raises(exceptions.NotAllowedInPatronMode):
        allocate(
            AllocationRequest(
                initial_payload, initial_signature, override_existing_allocations=True
            )
        )


def test_allocate_empty_allocations_list_should_fail(tos_users, proposal_accounts):
    # Test data
    initial_payload = create_payload([], None)
    initial_signature = sign(
        tos_users[0], build_allocations_eip712_data(initial_payload)
    )

    # Call allocate method
    with pytest.raises(exceptions.EmptyAllocations):
        allocate(
            AllocationRequest(
                initial_payload, initial_signature, override_existing_allocations=True
            )
        )


def test_get_by_user_and_epoch(mock_allocations_db, user_accounts, proposal_accounts):
    result = get_all_by_user_and_epoch(
        user_accounts[0].address, MOCKED_PENDING_EPOCH_NO
    )

    assert len(result) == 3
    assert result[0].address == proposal_accounts[0].address
    assert result[0].amount == str(10 * 10**18)
    assert result[1].address == proposal_accounts[1].address
    assert result[1].amount == str(5 * 10**18)
    assert result[2].address == proposal_accounts[2].address
    assert result[2].amount == str(300 * 10**18)


def test_get_all_by_epoch(
    mock_pending_epoch_snapshot_db,
    mock_allocations_db,
    get_all_by_epoch_expected_result,
):
    result = get_all_by_epoch(MOCKED_PENDING_EPOCH_NO)

    assert len(result) == len(get_all_by_epoch_expected_result)
    for i in result:
        assert dataclasses.asdict(i) in get_all_by_epoch_expected_result


def test_get_by_epoch_fails_for_current_or_future_epoch(
    mock_allocations_db, user_accounts, proposal_accounts
):
    with pytest.raises(exceptions.EpochAllocationPeriodNotStartedYet):
        get_all_by_epoch(MOCKED_PENDING_EPOCH_NO + 1)


def test_get_all_by_epoch_with_allocation_amount_equal_0(
    mock_pending_epoch_snapshot_db,
    mock_allocations_db,
    user_accounts,
    proposal_accounts,
    get_all_by_epoch_expected_result,
):
    user = database.user.get_or_add_user(user_accounts[2].address)
    db.session.commit()
    user_allocations = [
        Allocation(proposal_accounts[1].address, 0),
    ]
    database.allocations.add_all(MOCKED_PENDING_EPOCH_NO, user.id, 0, user_allocations)

    result = get_all_by_epoch(MOCKED_PENDING_EPOCH_NO)

    assert len(result) == len(get_all_by_epoch_expected_result)
    for i in result:
        assert dataclasses.asdict(i) in get_all_by_epoch_expected_result


def test_get_by_proposal_and_epoch(
    mock_allocations_db, user_accounts, proposal_accounts
):
    result = get_all_by_proposal_and_epoch(
        proposal_accounts[1].address, MOCKED_PENDING_EPOCH_NO
    )

    assert len(result) == 2
    assert result[0].address == user_accounts[0].address
    assert result[0].amount == str(5 * 10**18)
    assert result[1].address == user_accounts[1].address
    assert result[1].amount == str(1050 * 10**18)


def test_get_by_proposal_and_epoch_with_allocation_amount_equal_0(
    mock_allocations_db, user_accounts, proposal_accounts
):
    user = database.user.get_or_add_user(user_accounts[2].address)
    db.session.commit()
    user_allocations = [
        Allocation(proposal_accounts[1].address, 0),
    ]
    database.allocations.add_all(MOCKED_PENDING_EPOCH_NO, user.id, 0, user_allocations)

    result = get_all_by_proposal_and_epoch(
        proposal_accounts[1].address, MOCKED_PENDING_EPOCH_NO
    )

    assert len(result) == 2
    assert result[0].address == user_accounts[0].address
    assert result[0].amount == str(5 * 10**18)
    assert result[1].address == user_accounts[1].address
    assert result[1].amount == str(1050 * 10**18)


def test_get_sum_by_epoch(mock_allocations_db, user_accounts, proposal_accounts):
    result = get_sum_by_epoch(MOCKED_PENDING_EPOCH_NO)
    assert result == 1865 * 10**18


def test_user_exceeded_rewards_budget_in_allocations(app, proposal_accounts, tos_users):
    # Set some reasonable user rewards budget
    MOCK_GET_USER_BUDGET.return_value = 100 * 10**18

    # First payload sums up to 110 eth (budget is set to 100)
    payload = create_payload(
        proposal_accounts[0:3], [10 * 10**18, 50 * 10**18, 50 * 10**18]
    )
    signature = sign(tos_users[0], build_allocations_eip712_data(payload))

    with pytest.raises(exceptions.RewardsBudgetExceeded):
        allocate(
            AllocationRequest(payload, signature, override_existing_allocations=True)
        )

    # Lower it to 100 total (should pass)
    payload = create_payload(
        proposal_accounts[0:3], [10 * 10**18, 40 * 10**18, 50 * 10**18]
    )
    signature = sign(tos_users[0], build_allocations_eip712_data(payload))
    allocate(AllocationRequest(payload, signature, override_existing_allocations=True))


def test_nonces(tos_users, proposal_accounts):
    nonce0 = get_allocation_nonce(tos_users[0].address)
    payload = create_payload(
        proposal_accounts[0:2], [10 * 10**18, 20 * 10**18], nonce0
    )
    signature = sign(tos_users[0], build_allocations_eip712_data(payload))
    allocate(AllocationRequest(payload, signature, override_existing_allocations=True))
    nonce1 = get_allocation_nonce(tos_users[0].address)
    assert nonce0 != nonce1
    payload = create_payload(
        proposal_accounts[0:2], [10 * 10**18, 30 * 10**18], nonce1
    )
    signature = sign(tos_users[0], build_allocations_eip712_data(payload))
    allocate(AllocationRequest(payload, signature, override_existing_allocations=True))
    nonce2 = get_allocation_nonce(tos_users[0].address)
    assert nonce1 != nonce2

    payload = create_payload(
        proposal_accounts[0:2], [10 * 10**18, 10 * 10**18], nonce1
    )
    signature = sign(tos_users[0], build_allocations_eip712_data(payload))
    with pytest.raises(exceptions.WrongAllocationsNonce):
        allocate(
            AllocationRequest(payload, signature, override_existing_allocations=True)
        )


def test_stores_allocation_request_signature(tos_users, proposal_accounts):
    nonce0 = get_allocation_nonce(tos_users[0].address)
    payload = create_payload(
        proposal_accounts[0:2], [10 * 10**18, 20 * 10**18], nonce0
    )
    signature = sign(tos_users[0], build_allocations_eip712_data(payload))

    allocate(AllocationRequest(payload, signature, override_existing_allocations=True))

    alloc_signature = database.allocations.get_allocation_signature_by_user_nonce(
        tos_users[0].address, nonce0
    )

    assert alloc_signature is not None

    assert alloc_signature.epoch == MOCKED_PENDING_EPOCH_NO
    assert alloc_signature.signature == signature


def check_allocations(user_address, expected_payload, expected_count):
    epoch = MOCKED_PENDING_EPOCH_NO
    expected_allocations = deserialize_allocations(expected_payload)
    user = database.user.get_by_address(user_address)
    assert user is not None

    db_allocations = database.allocations.get_all_by_epoch_and_user_id(epoch, user.id)
    assert len(db_allocations) == expected_count

    for db_allocation, expected_allocation in zip(db_allocations, expected_allocations):
        assert db_allocation.epoch == epoch
        assert db_allocation.user_id == user.id
        assert db_allocation.user is not None
        assert db_allocation.proposal_address == expected_allocation.proposal_address
        assert int(db_allocation.amount) == expected_allocation.amount


def check_allocation_threshold(*payloads):
    epoch = MOCKED_PENDING_EPOCH_NO
    expected = [deserialize_allocations(payload) for payload in payloads]

    db_allocations = database.allocations.get_all_by_epoch(epoch)

    total_allocations = sum([int(allocation.amount) for allocation in db_allocations])
    total_payload_allocations = sum(
        [allocation.amount for allocations in expected for allocation in allocations]
    )

    assert total_allocations == total_payload_allocations
