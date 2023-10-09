import pytest

import dataclasses

from app import database, exceptions
from app.controllers import rewards
from app.controllers.allocations import (
    get_all_by_user_and_epoch,
    get_all_by_proposal_and_epoch,
    get_allocation_nonce,
    get_all_by_epoch,
    get_sum_by_epoch,
    allocate,
    simulate_allocation,
)
from app.core.allocations import (
    AllocationRequest,
    Allocation,
)
from app.core.rewards.rewards import calculate_matched_rewards_threshold
from app.crypto.eip712 import sign, build_allocations_eip712_data
from app.extensions import db
from tests.conftest import (
    create_payload,
    deserialize_allocations,
    MOCKED_PENDING_EPOCH_NO,
    MOCK_PROPOSALS,
    MOCK_EPOCHS,
    MOCK_GET_USER_BUDGET,
)


@pytest.fixture(autouse=True)
def before(
    app,
    proposal_accounts,
    patch_epochs,
    patch_proposals,
    patch_has_pending_epoch_snapshot,
    patch_user_budget,
):
    MOCK_PROPOSALS.get_proposal_addresses.return_value = [
        p.address for p in proposal_accounts[0:5]
    ]


def test_simulate_allocation_single_user(
    user_accounts, proposal_accounts, mock_pending_epoch_snapshot_db
):
    # Test data
    user1 = database.user.get_by_address(user_accounts[0].address)
    user1_allocations = [
        Allocation(proposal_accounts[0].address, 10 * 10**18),
        Allocation(proposal_accounts[1].address, 20 * 10**18),
        Allocation(proposal_accounts[2].address, 30 * 10**18),
    ]
    database.allocations.add_all(
        MOCKED_PENDING_EPOCH_NO, user1.id, 0, user1_allocations
    )
    db.session.commit()

    payload = create_payload(proposal_accounts[0:2], [40 * 10**18, 50 * 10**18])
    proposal_rewards_before = rewards.get_proposals_rewards()

    assert len(proposal_rewards_before) == 5
    assert (
        proposal_rewards_before[0].address
        == "0xBcd4042DE499D14e55001CcbB24a551F3b954096"
    )
    assert proposal_rewards_before[0].allocated == 10000000000000000000
    assert proposal_rewards_before[0].matched == 36_685733052_583541401
    assert (
        proposal_rewards_before[1].address
        == "0x71bE63f3384f5fb98995898A86B02Fb2426c5788"
    )
    assert proposal_rewards_before[1].allocated == 20000000000000000000
    assert proposal_rewards_before[1].matched == 73_371466105_167082802
    assert (
        proposal_rewards_before[2].address
        == "0xFABB0ac9d68B0B445fB7357272Ff202C5651694a"
    )
    assert proposal_rewards_before[2].allocated == 30000000000000000000
    assert proposal_rewards_before[2].matched == 110_057199157_750624203
    assert (
        proposal_rewards_before[3].address
        == "0x1CBd3b2770909D4e10f157cABC84C7264073C9Ec"
    )
    assert proposal_rewards_before[3].allocated == 0
    assert proposal_rewards_before[3].matched == 0
    assert (
        proposal_rewards_before[4].address
        == "0xdF3e18d64BC6A983f673Ab319CCaE4f1a57C7097"
    )
    assert proposal_rewards_before[4].allocated == 0
    assert proposal_rewards_before[4].matched == 0

    # Call simulate allocation method
    leverage, result = simulate_allocation(payload, user_accounts[0].address)

    assert len(result) == 5
    assert result[0].address == "0xBcd4042DE499D14e55001CcbB24a551F3b954096"
    assert result[0].allocated == 40000000000000000000
    assert result[0].matched == 97_828621473_556110403
    assert result[1].address == "0x71bE63f3384f5fb98995898A86B02Fb2426c5788"
    assert result[1].allocated == 50000000000000000000
    assert result[1].matched == 122_28577684_1945138003
    assert result[2].address == "0xFABB0ac9d68B0B445fB7357272Ff202C5651694a"
    assert result[2].allocated == 0
    assert result[2].matched == 0
    assert result[3].address == "0x1CBd3b2770909D4e10f157cABC84C7264073C9Ec"
    assert result[3].allocated == 0
    assert result[3].matched == 0
    assert result[4].address == "0xdF3e18d64BC6A983f673Ab319CCaE4f1a57C7097"
    assert result[4].allocated == 0
    assert result[4].matched == 0

    # check leverage value
    assert leverage == 2.445715536838903

    # Ensure changes made in the simulation are not saved to db
    proposal_rewards_after = rewards.get_proposals_rewards()
    assert proposal_rewards_before == proposal_rewards_after


def test_simulate_allocation_multiple_users(
    user_accounts, proposal_accounts, mock_pending_epoch_snapshot_db
):
    # Test data
    user1 = database.user.get_by_address(user_accounts[0].address)
    user2 = database.user.get_by_address(user_accounts[1].address)
    user1_allocations = [
        Allocation(proposal_accounts[0].address, 10 * 10**18),
        Allocation(proposal_accounts[1].address, 20 * 10**18),
        Allocation(proposal_accounts[2].address, 30 * 10**18),
    ]
    user2_allocations = [
        Allocation(proposal_accounts[1].address, 40 * 10**18),
        Allocation(proposal_accounts[2].address, 50 * 10**18),
    ]
    database.allocations.add_all(
        MOCKED_PENDING_EPOCH_NO, user1.id, 0, user1_allocations
    )
    database.allocations.add_all(
        MOCKED_PENDING_EPOCH_NO, user2.id, 0, user2_allocations
    )
    db.session.commit()

    payload = create_payload(proposal_accounts[0:2], [60 * 10**18, 70 * 10**18])
    proposal_rewards_before = rewards.get_proposals_rewards()

    assert len(proposal_rewards_before) == 5
    assert (
        proposal_rewards_before[0].address
        == "0xBcd4042DE499D14e55001CcbB24a551F3b954096"
    )
    assert proposal_rewards_before[0].allocated == 10000000000000000000
    assert proposal_rewards_before[0].matched == 0
    assert (
        proposal_rewards_before[1].address
        == "0x71bE63f3384f5fb98995898A86B02Fb2426c5788"
    )
    assert proposal_rewards_before[1].allocated == 60000000000000000000
    assert proposal_rewards_before[1].matched == 94_334742135_214820745
    assert (
        proposal_rewards_before[2].address
        == "0xFABB0ac9d68B0B445fB7357272Ff202C5651694a"
    )
    assert proposal_rewards_before[2].allocated == 80000000000000000000
    assert proposal_rewards_before[2].matched == 125_779656180_286427661
    assert (
        proposal_rewards_before[3].address
        == "0x1CBd3b2770909D4e10f157cABC84C7264073C9Ec"
    )
    assert proposal_rewards_before[3].allocated == 0
    assert proposal_rewards_before[3].matched == 0
    assert (
        proposal_rewards_before[4].address
        == "0xdF3e18d64BC6A983f673Ab319CCaE4f1a57C7097"
    )
    assert proposal_rewards_before[4].allocated == 0
    assert proposal_rewards_before[4].matched == 0

    # Call simulate allocation method
    _, result = simulate_allocation(payload, user_accounts[0].address)

    assert len(result) == 5
    assert result[0].address == "0xBcd4042DE499D14e55001CcbB24a551F3b954096"
    assert result[0].allocated == 60000000000000000000
    assert result[0].matched == 60_031199540_591249565
    assert result[1].address == "0x71bE63f3384f5fb98995898A86B02Fb2426c5788"
    assert result[1].allocated == 110000000000000000000
    assert result[1].matched == 110_057199157_750624203
    assert result[2].address == "0xFABB0ac9d68B0B445fB7357272Ff202C5651694a"
    assert result[2].allocated == 50000000000000000000
    assert result[2].matched == 50_025999617_159374637
    assert result[3].address == "0x1CBd3b2770909D4e10f157cABC84C7264073C9Ec"
    assert result[3].allocated == 0
    assert result[3].matched == 0
    assert result[4].address == "0xdF3e18d64BC6A983f673Ab319CCaE4f1a57C7097"
    assert result[4].allocated == 0
    assert result[4].matched == 0

    # Ensure changes made in the simulation are not saved to db
    proposal_rewards_after = rewards.get_proposals_rewards()
    assert proposal_rewards_before == proposal_rewards_after


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
    MOCK_EPOCHS.get_pending_epoch.return_value = 0

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
    payload = create_payload(proposal_accounts[0:3], None)
    signature = sign(proposal_accounts[0], build_allocations_eip712_data(payload))

    with pytest.raises(exceptions.ProposalAllocateToItself):
        allocate(
            AllocationRequest(payload, signature, override_existing_allocations=True)
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


def test_get_by_all_epoch(
    mock_pending_epoch_snapshot_db,
    mock_allocations_db,
    user_accounts,
    proposal_accounts,
):
    expected_result = [
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

    result = get_all_by_epoch(MOCKED_PENDING_EPOCH_NO)

    assert len(result) == len(expected_result)
    for i in result:
        assert dataclasses.asdict(i) in expected_result


def test_get_by_epoch_fails_for_current_or_future_epoch(
    mock_allocations_db, user_accounts, proposal_accounts
):
    with pytest.raises(exceptions.EpochAllocationPeriodNotStartedYet):
        get_all_by_epoch(MOCKED_PENDING_EPOCH_NO + 1)


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
    projects_no = 5
    expected = [deserialize_allocations(payload) for payload in payloads]

    db_allocations = database.allocations.get_all_by_epoch(epoch)

    total_allocations = sum([int(allocation.amount) for allocation in db_allocations])
    total_payload_allocations = sum(
        [allocation.amount for allocations in expected for allocation in allocations]
    )

    assert total_allocations == total_payload_allocations

    expected_threshold = int(total_allocations / (projects_no * 2))

    assert expected_threshold == calculate_matched_rewards_threshold(
        total_allocations, projects_no
    )
