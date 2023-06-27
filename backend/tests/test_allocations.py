from tests.conftest import create_payload, MOCKED_PENDING_EPOCH_NO
from unittest.mock import MagicMock, Mock

import pytest

from app import database, exceptions
from app.contracts.epochs import Epochs
from app.contracts.proposals import Proposals
from app.core.allocations import (
    allocate,
    deserialize_payload,
    calculate_threshold,
    AllocationRequest,
)
from app.crypto.eip712 import sign, build_allocations_eip712_data


@pytest.fixture(autouse=True)
def before(monkeypatch, proposal_accounts):
    mock_epochs = MagicMock(spec=Epochs)
    mock_proposals = MagicMock(spec=Proposals)
    mock_snapshotted = Mock()

    mock_epochs.get_pending_epoch.return_value = MOCKED_PENDING_EPOCH_NO
    mock_snapshotted.return_value = True

    monkeypatch.setattr(
        "app.core.allocations.has_pending_epoch_snapshot", mock_snapshotted
    )

    mock_proposals.get_proposal_addresses.return_value = [
        p.address for p in proposal_accounts[0:5]
    ]

    monkeypatch.setattr("app.core.allocations.proposals", mock_proposals)
    monkeypatch.setattr("app.core.allocations.epochs", mock_epochs)


def test_user_allocates_for_the_first_time(app, user_accounts, proposal_accounts):
    # Test data
    payload = create_payload(proposal_accounts[0:2], None)
    signature = sign(user_accounts[0], build_allocations_eip712_data(payload))

    # Call allocate method
    allocate(AllocationRequest(payload, signature, override_existing_allocations=True))

    # Check if allocations were created
    check_allocations(user_accounts[0].address, payload, 2)

    # Check if threshold is properly calculated
    check_allocation_threshold(payload)


def test_multiple_users_allocate_for_the_first_time(
    app, user_accounts, proposal_accounts
):
    # Test data
    payload1 = create_payload(proposal_accounts[0:2], None)
    signature1 = sign(user_accounts[0], build_allocations_eip712_data(payload1))

    payload2 = create_payload(proposal_accounts[0:3], None)
    signature2 = sign(user_accounts[1], build_allocations_eip712_data(payload2))

    # Call allocate method for both users
    allocate(
        AllocationRequest(payload1, signature1, override_existing_allocations=True)
    )
    allocate(
        AllocationRequest(payload2, signature2, override_existing_allocations=True)
    )

    # Check if allocations were created for both users
    check_allocations(user_accounts[0].address, payload1, 2)
    check_allocations(user_accounts[1].address, payload2, 3)

    # Check if threshold is properly calculated
    check_allocation_threshold(payload1, payload2)


def test_allocate_updates_with_more_proposals(app, user_accounts, proposal_accounts):
    # Test data
    initial_payload = create_payload(proposal_accounts[0:2], None)
    initial_signature = sign(
        user_accounts[0], build_allocations_eip712_data(initial_payload)
    )

    # Call allocate method
    allocate(
        AllocationRequest(
            initial_payload, initial_signature, override_existing_allocations=True
        )
    )

    # Create a new payload with more proposals
    updated_payload = create_payload(proposal_accounts[0:3], None)
    updated_signature = sign(
        user_accounts[0], build_allocations_eip712_data(updated_payload)
    )

    # Call allocate method with updated_payload
    allocate(
        AllocationRequest(
            updated_payload, updated_signature, override_existing_allocations=True
        )
    )

    # Check if allocations were updated
    check_allocations(user_accounts[0].address, updated_payload, 3)

    # Check if threshold is properly calculated
    check_allocation_threshold(updated_payload)


def test_allocate_updates_with_less_proposals(app, user_accounts, proposal_accounts):
    # Test data
    initial_payload = create_payload(proposal_accounts[0:3], None)
    initial_signature = sign(
        user_accounts[0], build_allocations_eip712_data(initial_payload)
    )

    # Call allocate method
    allocate(
        AllocationRequest(
            initial_payload, initial_signature, override_existing_allocations=True
        )
    )

    # Create a new payload with fewer proposals
    updated_payload = create_payload(proposal_accounts[0:2], None)
    updated_signature = sign(
        user_accounts[0], build_allocations_eip712_data(updated_payload)
    )

    # Call allocate method with updated_payload
    allocate(
        AllocationRequest(
            updated_payload, updated_signature, override_existing_allocations=True
        )
    )

    # Check if allocations were updated
    check_allocations(user_accounts[0].address, updated_payload, 2)

    # Check if threshold is properly calculated
    check_allocation_threshold(updated_payload)


def test_multiple_users_change_their_allocations(app, user_accounts, proposal_accounts):
    # Create initial payloads and signatures for both users
    initial_payload1 = create_payload(proposal_accounts[0:2], None)
    initial_signature1 = sign(
        user_accounts[0], build_allocations_eip712_data(initial_payload1)
    )
    initial_payload2 = create_payload(proposal_accounts[0:3], None)
    initial_signature2 = sign(
        user_accounts[1], build_allocations_eip712_data(initial_payload2)
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
    updated_payload1 = create_payload(proposal_accounts[0:4], None)
    updated_signature1 = sign(
        user_accounts[0], build_allocations_eip712_data(updated_payload1)
    )
    updated_payload2 = create_payload(proposal_accounts[2:5], None)
    updated_signature2 = sign(
        user_accounts[1], build_allocations_eip712_data(updated_payload2)
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
    check_allocations(user_accounts[0].address, updated_payload1, 4)
    check_allocations(user_accounts[1].address, updated_payload2, 3)

    # Check if threshold is properly calculated
    check_allocation_threshold(updated_payload1, updated_payload2)


def test_allocation_validation_errors(
    app, monkeypatch, proposal_accounts, user_accounts
):
    # Test data
    payload = create_payload(proposal_accounts[0:3], None)
    signature = sign(user_accounts[0], build_allocations_eip712_data(payload))

    mock_snapshotted = Mock()
    mock_snapshotted.return_value = True
    monkeypatch.setattr(
        "app.core.allocations.has_pending_epoch_snapshot", mock_snapshotted
    )

    # Set invalid number of proposals on purpose (two proposals while three are needed)
    mock_proposals = MagicMock(spec=Proposals)
    mock_proposals.get_proposal_addresses.return_value = [
        p.address for p in proposal_accounts[0:2]
    ]
    monkeypatch.setattr("app.core.allocations.proposals", mock_proposals)

    mock_epochs = MagicMock(spec=Epochs)

    # Set invalid epoch on purpose (mimicking no pending epoch)
    mock_epochs.get_pending_epoch.return_value = 0
    monkeypatch.setattr("app.core.allocations.epochs", mock_epochs)

    # Call allocate method, expect exception
    with pytest.raises(exceptions.NotInDecisionWindow):
        allocate(
            AllocationRequest(payload, signature, override_existing_allocations=True)
        )

    # Fix pending epoch
    mock_epochs.get_pending_epoch.return_value = MOCKED_PENDING_EPOCH_NO

    # Call allocate method, expect invalid proposals
    with pytest.raises(exceptions.InvalidProposals):
        allocate(
            AllocationRequest(payload, signature, override_existing_allocations=True)
        )

    # Fix missing proposals
    mock_proposals.get_proposal_addresses.return_value = [
        p.address for p in proposal_accounts[0:3]
    ]

    # Expect no validation errors at this point
    allocate(AllocationRequest(payload, signature, override_existing_allocations=True))


def check_allocations(user_address, expected_payload, expected_count):
    epoch = MOCKED_PENDING_EPOCH_NO
    expected_allocations = deserialize_payload(expected_payload)
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
    projects_no = 5
    expected = [deserialize_payload(payload) for payload in payloads]

    db_allocations = database.allocations.get_all_by_epoch(epoch)

    total_allocations = sum([int(allocation.amount) for allocation in db_allocations])
    total_payload_allocations = sum(
        [allocation.amount for allocations in expected for allocation in allocations]
    )

    assert total_allocations == total_payload_allocations

    expected_threshold = int(total_allocations / (projects_no * 2))

    assert expected_threshold == calculate_threshold(total_allocations, projects_no)
