from random import randint

from app.core.allocations import allocate, deserialize_payload
from app.crypto.eip712 import sign, build_allocations_eip712_data
from app.database import User, Allocation


def test_user_allocates_for_the_first_time(app, user_accounts, proposal_accounts):
    # Test data
    payload = create_payload(proposal_accounts[0:2])
    signature = sign(user_accounts[0], build_allocations_eip712_data(payload))

    # Call allocate method
    allocate(payload, signature)

    # Check if allocations were created
    check_allocations(user_accounts[0].address, payload, 2)


def test_multiple_users_allocate_for_the_first_time(app, user_accounts, proposal_accounts):
    # Test data
    payload1 = create_payload(proposal_accounts[0:2])
    signature1 = sign(user_accounts[0], build_allocations_eip712_data(payload1))

    payload2 = create_payload(proposal_accounts[0:3])
    signature2 = sign(user_accounts[1], build_allocations_eip712_data(payload2))

    # Call allocate method for both users
    allocate(payload1, signature1)
    allocate(payload2, signature2)

    # Check if allocations were created for both users
    check_allocations(user_accounts[0].address, payload1, 2)
    check_allocations(user_accounts[1].address, payload2, 3)


def test_allocate_updates_with_more_proposals(app, user_accounts, proposal_accounts):
    # Test data
    initial_payload = create_payload(proposal_accounts[0:2])
    initial_signature = sign(user_accounts[0], build_allocations_eip712_data(initial_payload))

    # Call allocate method
    allocate(initial_payload, initial_signature)

    # Create a new payload with more proposals
    updated_payload = create_payload(proposal_accounts[0:3])
    updated_signature = sign(user_accounts[0], build_allocations_eip712_data(updated_payload))

    # Call allocate method with updated_payload
    allocate(updated_payload, updated_signature)

    # Check if allocations were updated
    check_allocations(user_accounts[0].address, updated_payload, 3)


def test_allocate_updates_with_less_proposals(app, user_accounts, proposal_accounts):
    # Test data
    initial_payload = create_payload(proposal_accounts[0:3])
    initial_signature = sign(user_accounts[0], build_allocations_eip712_data(initial_payload))

    # Call allocate method
    allocate(initial_payload, initial_signature)

    # Create a new payload with fewer proposals
    updated_payload = create_payload(proposal_accounts[0:2])
    updated_signature = sign(user_accounts[0], build_allocations_eip712_data(updated_payload))

    # Call allocate method with updated_payload
    allocate(updated_payload, updated_signature)

    # Check if allocations were updated
    check_allocations(user_accounts[0].address, updated_payload, 2)


def test_multiple_users_change_their_allocations(app, user_accounts, proposal_accounts):
    # Create initial payloads and signatures for both users
    initial_payload1 = create_payload(proposal_accounts[0:2])
    initial_signature1 = sign(user_accounts[0], build_allocations_eip712_data(initial_payload1))
    initial_payload2 = create_payload(proposal_accounts[0:3])
    initial_signature2 = sign(user_accounts[1], build_allocations_eip712_data(initial_payload2))

    # Call allocate method with initial payloads for both users
    allocate(initial_payload1, initial_signature1)
    allocate(initial_payload2, initial_signature2)

    # Create updated payloads for both users
    updated_payload1 = create_payload(proposal_accounts[0:4])
    updated_signature1 = sign(user_accounts[0], build_allocations_eip712_data(updated_payload1))
    updated_payload2 = create_payload(proposal_accounts[2:7])
    updated_signature2 = sign(user_accounts[1], build_allocations_eip712_data(updated_payload2))

    # Call allocate method with updated payloads for both users
    allocate(updated_payload1, updated_signature1)
    allocate(updated_payload2, updated_signature2)

    # Check if allocations were updated for both users
    check_allocations(user_accounts[0].address, updated_payload1, 4)
    check_allocations(user_accounts[1].address, updated_payload2, 5)


def check_allocations(user_address, expected_payload, expected_count):
    expected_allocations = deserialize_payload(expected_payload)
    user = User.query.filter_by(address=user_address).first()
    assert user is not None

    db_allocations = Allocation.query.filter_by(user_id=user.id).all()
    assert len(db_allocations) == expected_count

    for db_allocation, expected_allocation in zip(db_allocations, expected_allocations):
        assert db_allocation.epoch == 1
        assert db_allocation.user_id == user.id
        assert db_allocation.user is not None
        assert db_allocation.proposal_address == expected_allocation.proposalAddress
        assert db_allocation.amount == expected_allocation.amount


def create_payload(proposals):
    allocations = [{'proposalAddress': proposal.address, 'amount': randint(1, 1000)}
                   for proposal in proposals]

    return {"allocations": allocations}
