import pytest

from app import exceptions
from app.context.epoch_state import EpochState
from app.engine.projects.rewards import ProjectRewardDTO
from app.infrastructure import database
from app.infrastructure.database.uniqueness_quotient import (
    get_uq_by_address,
)
from app.legacy.crypto.eip712 import sign, build_allocations_eip712_data
from app.modules.dto import AllocationDTO
from app.modules.user.allocations import controller
from app.modules.user.allocations.service.pending import (
    PendingUserAllocations,
    PendingUserAllocationsVerifier,
)
from tests.conftest import (
    mock_graphql,
    MOCKED_PENDING_EPOCH_NO,
    MOCK_PROJECTS,
    MOCK_GET_USER_BUDGET,
    MOCK_IS_CONTRACT,
)
from tests.helpers import create_epoch_event
from tests.helpers import make_user_allocation
from tests.helpers.allocations import (
    create_payload,
    deserialize_allocations,
)
from tests.helpers.constants import MATCHED_REWARDS
from tests.helpers.context import get_context


def get_allocation_nonce(user_address):
    return controller.get_user_next_nonce(user_address)


def get_all_by_epoch(epoch):
    return controller.get_all_allocations(epoch)


@pytest.fixture(autouse=True)
def before(
    app,
    mocker,
    graphql_client,
    project_accounts,
    patch_epochs,
    patch_projects,
    patch_has_pending_epoch_snapshot,
    mock_pending_epoch_snapshot_db,
    patch_user_budget,
    patch_is_contract,
):
    MOCK_PROJECTS.get_project_addresses.return_value = [
        p.address for p in project_accounts[0:5]
    ]

    mock_graphql(
        mocker, epochs_events=[create_epoch_event(epoch=MOCKED_PENDING_EPOCH_NO)]
    )


@pytest.fixture()
def service(
    mock_octant_rewards,
    mock_patron_mode,
    mock_user_budgets,
    mock_user_allocation_nonce,
    mock_uniqueness_quotients,
):
    verifier = PendingUserAllocationsVerifier(
        user_nonce=mock_user_allocation_nonce,
        user_budgets=mock_user_budgets,
        patrons_mode=mock_patron_mode,
    )
    return PendingUserAllocations(
        octant_rewards=mock_octant_rewards,
        verifier=verifier,
        uniqueness_quotients=mock_uniqueness_quotients,
    )


def test_simulate_allocation(service, mock_users_db):
    context = get_context()
    projects = context.projects_details.projects

    user1, _, _ = mock_users_db
    make_user_allocation(context, user1)

    next_allocations = [
        AllocationDTO(projects[1], 200_000000000),
    ]

    leverage, threshold, rewards = service.simulate_allocation(
        context, next_allocations, user1.address
    )

    sorted_projects = sorted(projects)
    assert leverage == 1100571991.5775063
    assert threshold == 10_000000000
    assert rewards == [
        ProjectRewardDTO(sorted_projects[0], 0, 0),
        ProjectRewardDTO(sorted_projects[1], 0, 0),
        ProjectRewardDTO(sorted_projects[2], 200_000000000, MATCHED_REWARDS),
        ProjectRewardDTO(sorted_projects[3], 0, 0),
        ProjectRewardDTO(sorted_projects[4], 0, 0),
        ProjectRewardDTO(sorted_projects[5], 0, 0),
        ProjectRewardDTO(sorted_projects[6], 0, 0),
        ProjectRewardDTO(sorted_projects[7], 0, 0),
        ProjectRewardDTO(sorted_projects[8], 0, 0),
        ProjectRewardDTO(sorted_projects[9], 0, 0),
    ]

    # but the allocation didn't change
    assert service.get_user_allocation_sum(context, user1.address) == 100


def test_revoke_previous_allocation(service, mock_users_db):
    user1, _, _ = mock_users_db
    context = get_context(epoch_state=EpochState.PENDING)
    make_user_allocation(context, user1)

    assert service.get_user_allocation_sum(context, user1.address) == 100
    service.revoke_previous_allocation(context, user1.address)
    assert service.get_user_allocation_sum(context, user1.address) == 0


def test_user_allocates_for_the_first_time(tos_users, project_accounts):
    # Test data
    payload = create_payload(project_accounts[0:2], None)
    signature = sign(tos_users[0], build_allocations_eip712_data(payload))

    # Call allocate method
    controller.allocate(
        tos_users[0].address, {"payload": payload, "signature": signature}
    )

    # Check if allocations were created
    check_allocations(tos_users[0].address, payload, 2)

    # Check if threshold is properly calculated
    check_allocation_threshold(payload)


def test_multisig_allocates_for_the_first_time(
    tos_users, project_accounts, patch_eip1271_is_valid_signature
):
    # Test data
    MOCK_IS_CONTRACT.return_value = True
    payload = create_payload(project_accounts[0:2], None)
    signature = "0x89b0da9bcf620cd6005e88f58c69edff5251b80f116e25e88c65188bf116d35f5cdf6d3782885c8df66878a8b5ec8739fe1174c72b06fb277534e7d7088f9a6e1b2810662a03962f315a8ad0f448a468ab5ce0c73c31b71e499b4b735f5c04b76542cb89802f68c19918f306e29563b9f736b02559fbaccc55ad8bd2134a0e69811c"

    # Call allocate method
    controller.allocate(
        tos_users[0].address, {"payload": payload, "signature": signature}
    )

    # Check if allocations were created
    check_allocations(tos_users[0].address, payload, 2)

    # Check if threshold is properly calculated
    check_allocation_threshold(payload)


def test_multiple_users_allocate_for_the_first_time(tos_users, project_accounts):
    # Test data
    payload1 = create_payload(project_accounts[0:2], None)
    signature1 = sign(tos_users[0], build_allocations_eip712_data(payload1))

    payload2 = create_payload(project_accounts[0:3], None)
    signature2 = sign(tos_users[1], build_allocations_eip712_data(payload2))

    # Call allocate method for both users
    controller.allocate(
        tos_users[0].address, {"payload": payload1, "signature": signature1}
    )
    controller.allocate(
        tos_users[1].address, {"payload": payload2, "signature": signature2}
    )

    # Check if allocations were created for both users
    check_allocations(tos_users[0].address, payload1, 2)
    check_allocations(tos_users[1].address, payload2, 3)

    # Check if threshold is properly calculated
    check_allocation_threshold(payload1, payload2)


def test_allocate_updates_with_more_projects(tos_users, project_accounts):
    # Test data
    initial_payload = create_payload(project_accounts[0:2], None, 0)
    initial_signature = sign(
        tos_users[0], build_allocations_eip712_data(initial_payload)
    )

    # Call allocate method
    controller.allocate(
        tos_users[0].address,
        {"payload": initial_payload, "signature": initial_signature},
    )

    # Create a new payload with more projects
    updated_payload = create_payload(project_accounts[0:3], None, 1)
    updated_signature = sign(
        tos_users[0], build_allocations_eip712_data(updated_payload)
    )

    # Call allocate method with updated_payload
    controller.allocate(
        tos_users[0].address,
        {"payload": updated_payload, "signature": updated_signature},
    )

    # Check if allocations were updated
    check_allocations(tos_users[0].address, updated_payload, 3)

    # Check if threshold is properly calculated
    check_allocation_threshold(updated_payload)


def test_allocate_updates_with_less_projects(tos_users, project_accounts):
    # Test data
    initial_payload = create_payload(project_accounts[0:3], None, 0)
    initial_signature = sign(
        tos_users[0], build_allocations_eip712_data(initial_payload)
    )

    # Call allocate method
    controller.allocate(
        tos_users[0].address,
        {"payload": initial_payload, "signature": initial_signature},
    )

    # Create a new payload with fewer projects
    updated_payload = create_payload(project_accounts[0:2], None, 1)
    updated_signature = sign(
        tos_users[0], build_allocations_eip712_data(updated_payload)
    )

    # Call allocate method with updated_payload
    controller.allocate(
        tos_users[0].address,
        {"payload": updated_payload, "signature": updated_signature},
    )

    # Check if allocations were updated
    check_allocations(tos_users[0].address, updated_payload, 2)

    # Check if threshold is properly calculated
    check_allocation_threshold(updated_payload)


def test_multiple_users_change_their_allocations(tos_users, project_accounts):
    # Create initial payloads and signatures for both users
    initial_payload1 = create_payload(project_accounts[0:2], None, 0)
    initial_signature1 = sign(
        tos_users[0], build_allocations_eip712_data(initial_payload1)
    )
    initial_payload2 = create_payload(project_accounts[0:3], None, 0)
    initial_signature2 = sign(
        tos_users[1], build_allocations_eip712_data(initial_payload2)
    )

    # Call allocate method with initial payloads for both users
    controller.allocate(
        tos_users[0].address,
        {"payload": initial_payload1, "signature": initial_signature1},
    )
    controller.allocate(
        tos_users[1].address,
        {"payload": initial_payload2, "signature": initial_signature2},
    )

    # Create updated payloads for both users
    updated_payload1 = create_payload(project_accounts[0:4], None, 1)
    updated_signature1 = sign(
        tos_users[0], build_allocations_eip712_data(updated_payload1)
    )
    updated_payload2 = create_payload(project_accounts[2:5], None, 1)
    updated_signature2 = sign(
        tos_users[1], build_allocations_eip712_data(updated_payload2)
    )

    # Call allocate method with updated payloads for both users
    controller.allocate(
        tos_users[0].address,
        {"payload": updated_payload1, "signature": updated_signature1},
    )
    controller.allocate(
        tos_users[1].address,
        {"payload": updated_payload2, "signature": updated_signature2},
    )

    # Check if allocations were updated for both users
    check_allocations(tos_users[0].address, updated_payload1, 4)
    check_allocations(tos_users[1].address, updated_payload2, 3)

    # Check if threshold is properly calculated
    check_allocation_threshold(updated_payload1, updated_payload2)


def test_user_exceeded_rewards_budget_in_allocations(app, project_accounts, tos_users):
    # Set some reasonable user rewards budget
    MOCK_GET_USER_BUDGET.return_value = 100 * 10**18

    # First payload sums up to 110 eth (budget is set to 100)
    payload = create_payload(
        project_accounts[0:3], [10 * 10**18, 50 * 10**18, 50 * 10**18]
    )
    signature = sign(tos_users[0], build_allocations_eip712_data(payload))

    with pytest.raises(exceptions.RewardsBudgetExceeded):
        controller.allocate(
            tos_users[0].address, {"payload": payload, "signature": signature}
        )

    # Lower it to 100 total (should pass)
    payload = create_payload(
        project_accounts[0:3], [10 * 10**18, 40 * 10**18, 50 * 10**18]
    )
    signature = sign(tos_users[0], build_allocations_eip712_data(payload))
    controller.allocate(
        tos_users[0].address, {"payload": payload, "signature": signature}
    )


def test_nonces(tos_users, project_accounts):
    nonce0 = get_allocation_nonce(tos_users[0].address)
    payload = create_payload(
        project_accounts[0:2], [10 * 10**18, 20 * 10**18], nonce0
    )
    signature = sign(tos_users[0], build_allocations_eip712_data(payload))
    controller.allocate(
        tos_users[0].address, {"payload": payload, "signature": signature}
    )
    nonce1 = get_allocation_nonce(tos_users[0].address)
    assert nonce0 != nonce1
    payload = create_payload(
        project_accounts[0:2], [10 * 10**18, 30 * 10**18], nonce1
    )
    signature = sign(tos_users[0], build_allocations_eip712_data(payload))
    controller.allocate(
        tos_users[0].address, {"payload": payload, "signature": signature}
    )

    nonce2 = get_allocation_nonce(tos_users[0].address)
    assert nonce1 != nonce2

    payload = create_payload(
        project_accounts[0:2], [10 * 10**18, 10 * 10**18], nonce1
    )
    signature = sign(tos_users[0], build_allocations_eip712_data(payload))
    with pytest.raises(exceptions.WrongAllocationsNonce):
        controller.allocate(
            tos_users[0].address, {"payload": payload, "signature": signature}
        )


def test_stores_allocation_request_signature(tos_users, project_accounts):
    nonce0 = get_allocation_nonce(tos_users[0].address)
    payload = create_payload(
        project_accounts[0:2], [10 * 10**18, 20 * 10**18], nonce0
    )
    signature = sign(tos_users[0], build_allocations_eip712_data(payload))

    controller.allocate(
        tos_users[0].address, {"payload": payload, "signature": signature}
    )

    alloc_signature = database.allocations.get_allocation_request_by_user_nonce(
        tos_users[0].address, nonce0
    )

    assert alloc_signature is not None

    assert alloc_signature.epoch == MOCKED_PENDING_EPOCH_NO
    assert alloc_signature.signature == signature


def test_stores_allocation_leverage(tos_users, project_accounts):
    nonce0 = get_allocation_nonce(tos_users[0].address)
    payload = create_payload(
        project_accounts[0:2], [10 * 10**18, 20 * 10**18], nonce0
    )
    signature = sign(tos_users[0], build_allocations_eip712_data(payload))
    expected_leverage, _, _ = controller.simulate_allocation(
        payload, tos_users[0].address
    )

    controller.allocate(
        tos_users[0].address, {"payload": payload, "signature": signature}
    )

    alloc_request = database.allocations.get_allocation_request_by_user_nonce(
        tos_users[0].address, nonce0
    )

    assert alloc_request.epoch == MOCKED_PENDING_EPOCH_NO
    assert alloc_request.leverage == expected_leverage


def test_uq_added_while_allocating(project_accounts, tos_users):
    user_addr = tos_users[0].address
    context = get_context(epoch_state=EpochState.PENDING)

    # There must be no uq before first allocation
    uq = get_uq_by_address(user_addr, context.epoch_details.epoch_num)
    assert uq is None

    # Allocate for the first time
    payload = create_payload(project_accounts[0:2], None, 0)
    signature = sign(tos_users[0], build_allocations_eip712_data(payload))
    controller.allocate(
        tos_users[0].address, {"payload": payload, "signature": signature}
    )

    uq_1 = get_uq_by_address(user_addr, context.epoch_details.epoch_num)
    assert uq_1.score == "0.2"

    # Allocate for the second time
    payload = create_payload(project_accounts[0:4], None, 1)
    signature = sign(tos_users[0], build_allocations_eip712_data(payload))
    controller.allocate(
        tos_users[0].address, {"payload": payload, "signature": signature}
    )

    # Make sure that the UQ score hasn't changed (ie. the value and identifier remained unchanged)
    uq_2 = get_uq_by_address(user_addr, context.epoch_details.epoch_num)
    assert uq_1.id == uq_2.id
    assert uq_1.score == uq_2.score


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
        assert db_allocation.project_address == expected_allocation.project_address
        assert int(db_allocation.amount) == expected_allocation.amount


def check_allocation_threshold(*payloads):
    epoch = MOCKED_PENDING_EPOCH_NO
    expected = [deserialize_allocations(payload) for payload in payloads]

    db_allocations = database.allocations.get_all(epoch)

    total_allocations = sum([int(allocation.amount) for allocation in db_allocations])
    total_payload_allocations = sum(
        [allocation.amount for allocations in expected for allocation in allocations]
    )

    assert total_allocations == total_payload_allocations
