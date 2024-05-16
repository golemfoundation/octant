import pytest
from freezegun import freeze_time

from app.infrastructure import database
from app.modules.common.time import from_timestamp_s
from app.modules.dto import (
    AllocationItem,
    ProjectDonationDTO,
    UserAllocationRequestPayload,
    UserAllocationPayload,
    AccountFundsDTO,
)
from app.modules.history.dto import (
    AllocationItem as HistoryAllocationItem,
    ProjectAllocationItem,
)
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
    return ProjectDonationDTO(user.address, item.amount, item.project_address)


def _mock_request(nonce):
    fake_signature = "0x0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000"

    return UserAllocationRequestPayload(
        payload=UserAllocationPayload([], nonce), signature=fake_signature
    )


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
    service, context, mock_users_db, project_accounts
):
    user1, _, _ = mock_users_db
    timestamp_before = from_timestamp_s(1710719999)
    timestamp_after = from_timestamp_s(1710720002)

    allocation1 = [
        AllocationItem(project_accounts[0].address, 100),
        AllocationItem(project_accounts[1].address, 100),
    ]
    allocation2 = [
        AllocationItem(project_accounts[0].address, 200),
        AllocationItem(project_accounts[1].address, 200),
    ]

    make_user_allocation(context, user1, nonce=0, allocation_items=allocation1)
    make_user_allocation(
        context, user1, nonce=1, allocation_items=allocation2, leverage=2015.1555
    )

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
            epoch=1,
            timestamp=from_timestamp_s(1710720000),
            is_manually_edited=None,
            leverage=2015.1555,
            allocations=[
                ProjectAllocationItem(
                    project_address=project_accounts[0].address,
                    amount=200,
                ),
                ProjectAllocationItem(
                    project_address=project_accounts[1].address,
                    amount=200,
                ),
            ],
        ),
        HistoryAllocationItem(
            epoch=1,
            timestamp=from_timestamp_s(1710720000),
            is_manually_edited=None,
            leverage=None,
            allocations=[
                ProjectAllocationItem(
                    project_address=project_accounts[0].address,
                    amount=100,
                ),
                ProjectAllocationItem(
                    project_address=project_accounts[1].address,
                    amount=100,
                ),
            ],
        ),
    ]

    assert result_after_with_limit == [
        HistoryAllocationItem(
            epoch=1,
            timestamp=from_timestamp_s(1710720000),
            is_manually_edited=None,
            leverage=2015.1555,
            allocations=[
                ProjectAllocationItem(
                    project_address=project_accounts[0].address,
                    amount=200,
                ),
                ProjectAllocationItem(
                    project_address=project_accounts[1].address,
                    amount=200,
                ),
            ],
        ),
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


def test_get_all_allocations_returns_list_of_allocations_with_zero_allocations(
    service, context, mock_users_db
):
    user1, user2, user3 = mock_users_db

    user1_allocations = make_user_allocation(context, user1, allocations=2)
    user2_allocations = make_user_allocation(context, user2, allocations=2)
    user3_allocations = make_user_allocation(
        context,
        user3,
        allocation_items=[AllocationItem(context.projects_details.projects[0], 0)],
    )

    user1_donations = [_alloc_item_to_donation(a, user1) for a in user1_allocations]
    user2_donations = [_alloc_item_to_donation(a, user2) for a in user2_allocations]
    user3_donations = [_alloc_item_to_donation(a, user3) for a in user3_allocations]
    expected_results = user1_donations + user2_donations + user3_donations

    result = service.get_all_allocations(context)

    assert len(result) == 5
    for i in result:
        assert i in expected_results


def test_get_all_allocations_returns_list_of_allocations_without_zero_allocations(
    service, context, mock_users_db
):
    user1, user2, user3 = mock_users_db

    user1_allocations = make_user_allocation(context, user1, allocations=2)
    user2_allocations = make_user_allocation(context, user2, allocations=2)
    make_user_allocation(
        context,
        user3,
        allocation_items=[AllocationItem(context.projects_details.projects[0], 0)],
    )

    user1_donations = [_alloc_item_to_donation(a, user1) for a in user1_allocations]
    user2_donations = [_alloc_item_to_donation(a, user2) for a in user2_allocations]
    expected_results = user1_donations + user2_donations

    result = service.get_all_allocations(context, include_zero_allocations=False)

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
    service, context, mock_users_db, project_accounts
):
    user1, _, _ = mock_users_db
    allocation_items = [AllocationItem(project_accounts[0].address, 0)]
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
        AccountFundsDTO(address=a.project_address, amount=a.amount) for a in allocations
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
        AccountFundsDTO(address=a.project_address, amount=a.amount) for a in allocations
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
        AccountFundsDTO(address=a.project_address, amount=a.amount) for a in allocations
    ]

    assert service.get_last_user_allocation(context, user1.address) == (
        expected_result,
        False,
    )

    allocations = make_user_allocation(context, user1, nonce=1, is_manually_edited=True)
    expected_result = [
        AccountFundsDTO(address=a.project_address, amount=a.amount) for a in allocations
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
        assert d in list(filter(lambda d: d.project == project1, expected_results))

    result = service.get_allocations_by_project(context, project2)
    assert len(result) == 2
    for d in result:
        assert d in list(filter(lambda d: d.project == project2, expected_results))

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
