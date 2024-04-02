import pytest
from freezegun import freeze_time

from app.infrastructure import database
from app.modules.common.time import from_timestamp_s
from app.modules.dto import (
    AllocationItem,
    ProposalDonationDTO,
    UserAllocationRequestPayload,
    UserAllocationPayload,
    AccountFundsDTO,
)
from app.modules.history.dto import AllocationItem as HistoryAllocationItem
from app.modules.user.allocations.service.saved import SavedUserAllocations
from tests.helpers import make_user_allocation
from tests.helpers.context import get_context


@pytest.fixture(autouse=True)
def before(app):
    pass


@pytest.fixture()
def service():
    return SavedUserAllocations()


def _alloc_item_to_donation(item, user):
    return ProposalDonationDTO(user.address, item.amount, item.proposal_address)


def _mock_request(nonce):
    fake_signature = "0x0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000"

    return UserAllocationRequestPayload(
        payload=UserAllocationPayload([], nonce), signature=fake_signature
    )


def test_user_nonce_for_non_existent_user_is_0(service, alice):
    assert database.user.get_by_address(alice.address) is None
    assert service.get_user_next_nonce(alice.address) == 0


def test_user_nonce_for_new_user_is_0(service, mock_users_db):
    alice, _, _ = mock_users_db

    assert service.get_user_next_nonce(alice.address) == 0


def test_user_nonce_changes_increases_at_each_allocation_request(
    service, mock_users_db
):
    alice, _, _ = mock_users_db

    database.allocations.store_allocation_request(alice.address, 0, _mock_request(0))
    new_nonce = service.get_user_next_nonce(alice.address)

    assert new_nonce == 1

    database.allocations.store_allocation_request(
        alice.address, 0, _mock_request(new_nonce)
    )
    new_nonce = service.get_user_next_nonce(alice.address)

    assert new_nonce == 2


def test_user_nonce_changes_increases_at_each_allocation_request_for_each_user(
    service, mock_users_db
):
    alice, bob, carol = mock_users_db

    for i in range(0, 5):
        database.allocations.store_allocation_request(
            alice.address, 0, _mock_request(i)
        )
        next_user_nonce = service.get_user_next_nonce(alice.address)
        assert next_user_nonce == i + 1

        # for other users, nonces do not change
        assert service.get_user_next_nonce(bob.address) == 0
        assert service.get_user_next_nonce(carol.address) == 0

    for i in range(0, 4):
        database.allocations.store_allocation_request(bob.address, 0, _mock_request(i))
        next_user_nonce = service.get_user_next_nonce(bob.address)
        assert next_user_nonce == i + 1

        # for other users, nonces do not change
        assert service.get_user_next_nonce(alice.address) == 5
        assert service.get_user_next_nonce(carol.address) == 0

    for i in range(0, 3):
        database.allocations.store_allocation_request(
            carol.address, 0, _mock_request(i)
        )
        next_user_nonce = service.get_user_next_nonce(carol.address)
        assert next_user_nonce == i + 1

        # for other users, nonces do not change
        assert service.get_user_next_nonce(alice.address) == 5
        assert service.get_user_next_nonce(bob.address) == 4


def test_user_nonce_is_continuous_despite_epoch_changes(service, mock_users_db):
    alice, _, _ = mock_users_db

    database.allocations.store_allocation_request(alice.address, 1, _mock_request(0))
    new_nonce = service.get_user_next_nonce(alice.address)
    assert new_nonce == 1

    database.allocations.store_allocation_request(
        alice.address, 2, _mock_request(new_nonce)
    )
    new_nonce = service.get_user_next_nonce(alice.address)
    assert new_nonce == 2

    database.allocations.store_allocation_request(
        alice.address, 10, _mock_request(new_nonce)
    )
    new_nonce = service.get_user_next_nonce(alice.address)
    assert new_nonce == 3


def test_get_all_donors_addresses(service, mock_users_db):
    user1, user2, user3 = mock_users_db
    context_epoch_1 = get_context(1)
    context_epoch_2 = get_context(2)

    make_user_allocation(context_epoch_1, user1)
    make_user_allocation(context_epoch_1, user2)
    make_user_allocation(context_epoch_2, user3)

    result_epoch_1 = service.get_all_donors_addresses(context_epoch_1)
    result_epoch_2 = service.get_all_donors_addresses(context_epoch_2)

    assert result_epoch_1 == [user1.address, user2.address]
    assert result_epoch_2 == [user3.address]


def test_return_only_not_removed_allocations(service, mock_users_db):
    user1, user2, _ = mock_users_db

    context = get_context(1)
    make_user_allocation(context, user1)
    make_user_allocation(context, user2)
    database.allocations.soft_delete_all_by_epoch_and_user_id(1, user2.id)

    result = service.get_all_donors_addresses(context)

    assert result == [user1.address]


def test_get_user_allocation_sum(service, context, mock_users_db):
    user1, user2, _ = mock_users_db
    make_user_allocation(context, user1, allocations=2)
    make_user_allocation(context, user2, allocations=2)

    result = service.get_user_allocation_sum(context, user1.address)

    assert result == 300


def test_has_user_allocated_rewards(service, context, mock_users_db):
    user1, _, _ = mock_users_db
    make_user_allocation(context, user1)

    result = service.has_user_allocated_rewards(context, user1.address)

    assert result is True


def test_has_user_allocated_rewards_returns_false(service, context, mock_users_db):
    user1, user2, _ = mock_users_db

    make_user_allocation(context, user1)  # other user makes an allocation

    result = service.has_user_allocated_rewards(context, user2.address)

    assert result is False


@freeze_time("2024-03-18 00:00:00")
def test_user_allocations_by_timestamp(
    service, context, mock_users_db, proposal_accounts
):
    user1, _, _ = mock_users_db
    timestamp_before = from_timestamp_s(1710719999)
    timestamp_after = from_timestamp_s(1710720001)

    allocation = [
        AllocationItem(proposal_accounts[0].address, 100),
        AllocationItem(proposal_accounts[1].address, 100),
    ]
    make_user_allocation(context, user1, allocation_items=allocation)

    result_before = service.get_user_allocations_by_timestamp(
        user1.address, from_timestamp=timestamp_before, limit=20
    )
    result_after = service.get_user_allocations_by_timestamp(
        user1.address, from_timestamp=timestamp_after, limit=20
    )
    result_after_with_limit = service.get_user_allocations_by_timestamp(
        user1.address, from_timestamp=timestamp_after, limit=1
    )

    assert result_before == []
    assert result_after == [
        HistoryAllocationItem(
            project_address=proposal_accounts[0].address,
            epoch=1,
            amount=100,
            timestamp=from_timestamp_s(1710720000),
        ),
        HistoryAllocationItem(
            project_address=proposal_accounts[1].address,
            epoch=1,
            amount=100,
            timestamp=from_timestamp_s(1710720000),
        ),
    ]
    assert result_after_with_limit == [
        HistoryAllocationItem(
            project_address=proposal_accounts[0].address,
            epoch=1,
            amount=100,
            timestamp=from_timestamp_s(1710720000),
        )
    ]


def test_get_all_allocations_returns_empty_list_when_no_allocations(
    service, context, mock_users_db
):
    user1, _, _ = mock_users_db

    assert service.get_all_allocations(context) == []


def test_get_all_allocations_returns_list_of_allocations(
    service, context, mock_users_db
):
    user1, user2, _ = mock_users_db

    user1_allocations = make_user_allocation(context, user1, allocations=2)
    user2_allocations = make_user_allocation(context, user2, allocations=2)
    user1_donations = [_alloc_item_to_donation(a, user1) for a in user1_allocations]
    user2_donations = [_alloc_item_to_donation(a, user2) for a in user2_allocations]
    expected_results = user1_donations + user2_donations

    result = service.get_all_allocations(context)

    assert len(result) == 4
    for i in result:
        assert i in expected_results


def test_get_all_allocations_does_not_include_revoked_allocations_in_returned_list(
    service, context, mock_users_db
):
    user1, user2, _ = mock_users_db

    make_user_allocation(context, user1, allocations=2)
    database.allocations.soft_delete_all_by_epoch_and_user_id(
        context.epoch_details.epoch_num, user1.id
    )

    user2_allocations = make_user_allocation(context, user2, allocations=2)
    expected_results = [_alloc_item_to_donation(a, user2) for a in user2_allocations]

    result = service.get_all_allocations(context)

    assert len(result) == 2
    for i in result:
        assert i in expected_results


def test_get_all_allocations_does_not_return_allocations_from_previous_and_future_epochs(
    service, context, mock_users_db
):
    user1, _, _ = mock_users_db
    context_epoch_1 = get_context(1)
    context_epoch_2 = get_context(2)
    context_epoch_3 = get_context(3)

    make_user_allocation(context_epoch_1, user1)
    make_user_allocation(context_epoch_3, user1, nonce=1)

    assert service.get_all_allocations(context_epoch_2) == []


def test_get_all_with_allocation_amount_equal_0(
    service, context, mock_users_db, proposal_accounts
):
    user1, _, _ = mock_users_db
    allocation_items = [AllocationItem(proposal_accounts[0].address, 0)]
    make_user_allocation(context, user1, allocation_items=allocation_items)
    expected_result = [_alloc_item_to_donation(a, user1) for a in allocation_items]

    assert service.get_all_allocations(context) == expected_result


def test_get_last_user_allocation_when_no_allocation(service, context, alice):
    assert service.get_last_user_allocation(context, alice.address) == ([], None)


def test_get_last_user_allocation_returns_the_only_allocation(
    service, context, mock_users_db
):
    user1, _, _ = mock_users_db
    allocations = make_user_allocation(context, user1)
    expected_result = [
        AccountFundsDTO(address=a.proposal_address, amount=a.amount)
        for a in allocations
    ]

    assert service.get_last_user_allocation(context, user1.address) == (
        expected_result,
        None,
    )


def test_get_last_user_allocation_returns_the_only_the_last_allocation(
    service, context, mock_users_db
):
    user1, _, _ = mock_users_db
    _ = make_user_allocation(context, user1)
    allocations = make_user_allocation(context, user1, allocations=10, nonce=1)
    expected_result = [
        AccountFundsDTO(address=a.proposal_address, amount=a.amount)
        for a in allocations
    ]

    assert service.get_last_user_allocation(context, user1.address) == (
        expected_result,
        None,
    )


def test_get_last_user_allocation_returns_stored_metadata(
    service, context, mock_users_db
):
    user1, _, _ = mock_users_db

    allocations = make_user_allocation(context, user1, is_manually_edited=False)
    expected_result = [
        AccountFundsDTO(address=a.proposal_address, amount=a.amount)
        for a in allocations
    ]

    assert service.get_last_user_allocation(context, user1.address) == (
        expected_result,
        False,
    )

    allocations = make_user_allocation(context, user1, nonce=1, is_manually_edited=True)
    expected_result = [
        AccountFundsDTO(address=a.proposal_address, amount=a.amount)
        for a in allocations
    ]

    assert service.get_last_user_allocation(context, user1.address) == (
        expected_result,
        True,
    )


def test_get_allocations_by_project_returns_empty_list_when_no_allocations(
    service, context
):
    for project in context.projects_details.projects:
        assert service.get_allocations_by_project(context, project) == []


def test_get_allocations_by_project_returns_list_of_donations_per_project(
    service, context, mock_users_db
):
    user1, user2, _ = mock_users_db
    project1, project2 = (
        context.projects_details.projects[0],
        context.projects_details.projects[1],
    )

    user1_allocations = make_user_allocation(context, user1, allocations=2)
    user2_allocations = make_user_allocation(context, user2, allocations=2)
    user1_donations = [_alloc_item_to_donation(a, user1) for a in user1_allocations]
    user2_donations = [_alloc_item_to_donation(a, user2) for a in user2_allocations]
    expected_results = user1_donations + user2_donations

    result = service.get_allocations_by_project(context, project1)
    assert len(result) == 2
    for d in result:
        assert d in list(filter(lambda d: d.proposal == project1, expected_results))

    result = service.get_allocations_by_project(context, project2)
    assert len(result) == 2
    for d in result:
        assert d in list(filter(lambda d: d.proposal == project2, expected_results))

    assert result

    # other projects have no donations
    for project in context.projects_details.projects[2:]:
        assert service.get_allocations_by_project(context, project) == []


def test_get_allocations_by_project_with_allocation_amount_equal_0(
    service, context, mock_users_db
):
    user1, _, _ = mock_users_db
    project1 = context.projects_details.projects[0]

    allocation_items = [AllocationItem(project1, 0)]
    make_user_allocation(context, user1, allocation_items=allocation_items)

    assert service.get_allocations_by_project(context, project1) == []
