import pytest
from freezegun import freeze_time

from app.extensions import db
from app.infrastructure import database
from app.modules.common.time import from_timestamp_s
from app.modules.dto import AllocationDTO, AllocationItem, ProposalDonationDTO
from app.modules.user.allocations.controller import revoke_previous_allocation
from app.modules.user.allocations.service.saved import SavedUserAllocations

from tests.helpers.context import get_context


@pytest.fixture(autouse=True)
def before(app):
    pass


@pytest.fixture()
def service():
    return SavedUserAllocations()


def test_get_all_donors_addresses(service, mock_users_db, proposal_accounts):
    user1, user2, user3 = mock_users_db

    allocation = [
        AllocationDTO(proposal_accounts[0].address, 100),
    ]

    database.allocations.add_all(1, user1.id, 0, allocation)
    database.allocations.add_all(1, user2.id, 0, allocation)
    database.allocations.add_all(2, user3.id, 0, allocation)
    db.session.commit()

    context_epoch_1 = get_context(1)
    context_epoch_2 = get_context(2)

    result_epoch_1 = service.get_all_donors_addresses(context_epoch_1)
    result_epoch_2 = service.get_all_donors_addresses(context_epoch_2)

    assert result_epoch_1 == [user1.address, user2.address]
    assert result_epoch_2 == [user3.address]


def test_return_only_not_removed_allocations(service, mock_users_db, proposal_accounts):
    user1, user2, _ = mock_users_db

    allocation = [
        AllocationDTO(proposal_accounts[0].address, 100),
    ]

    database.allocations.add_all(1, user1.id, 0, allocation)
    database.allocations.add_all(1, user2.id, 0, allocation)
    database.allocations.soft_delete_all_by_epoch_and_user_id(1, user2.id)
    db.session.commit()

    context = get_context(1)

    result = service.get_all_donors_addresses(context)

    assert result == [user1.address]


def test_get_user_allocation_sum(service, context, mock_users_db, proposal_accounts):
    user1, user2, _ = mock_users_db
    allocation = [
        AllocationDTO(proposal_accounts[0].address, 100),
        AllocationDTO(proposal_accounts[1].address, 200),
    ]
    database.allocations.add_all(1, user1.id, 0, allocation)
    database.allocations.add_all(1, user2.id, 0, allocation)
    db.session.commit()

    result = service.get_user_allocation_sum(context, user1.address)

    assert result == 300


def test_has_user_allocated_rewards(service, context, mock_users_db, proposal_accounts):
    user1, _, _ = mock_users_db
    database.allocations.add_allocation_request(user1.address, 1, 0, "0x00", False)

    db.session.commit()

    result = service.has_user_allocated_rewards(context, user1.address)

    assert result is True


def test_has_user_allocated_rewards_returns_false(
    service, context, mock_users_db, proposal_accounts
):
    user1, _, _ = mock_users_db

    result = service.has_user_allocated_rewards(context, user1.address)

    assert result is False


@freeze_time("2024-03-18 00:00:00")
def test_user_allocations_by_timestamp(context, mock_users_db, proposal_accounts):
    user1, _, _ = mock_users_db
    timestamp_before = from_timestamp_s(1710719999)
    timestamp_after = from_timestamp_s(1710720001)

    allocation = [
        AllocationDTO(proposal_accounts[0].address, 100),
        AllocationDTO(proposal_accounts[1].address, 100),
    ]
    database.allocations.add_all(1, user1.id, 0, allocation)
    db.session.commit()

    service = SavedUserAllocations()

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
        AllocationItem(
            project_address=proposal_accounts[0].address,
            epoch=1,
            amount=100,
            timestamp=from_timestamp_s(1710720000),
        ),
        AllocationItem(
            project_address=proposal_accounts[1].address,
            epoch=1,
            amount=100,
            timestamp=from_timestamp_s(1710720000),
        ),
    ]
    assert result_after_with_limit == [
        AllocationItem(
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
    service, context, mock_users_db, proposal_accounts
):
    user1, user2, _ = mock_users_db
    allocation = [
        AllocationDTO(proposal_accounts[0].address, 100),
        AllocationDTO(proposal_accounts[1].address, 200),
    ]
    database.allocations.add_all(
        context.epoch_details.epoch_num, user1.id, 0, allocation
    )
    database.allocations.add_all(
        context.epoch_details.epoch_num, user2.id, 0, allocation
    )

    expected_results = []
    for a in allocation:
        expected_results.append(
            ProposalDonationDTO(user1.address, a.amount, a.proposal_address)
        )
        expected_results.append(
            ProposalDonationDTO(user2.address, a.amount, a.proposal_address)
        )

    result = service.get_all_allocations(context)

    assert len(result) == 4
    for i in result:
        assert i in expected_results


def test_get_all_allocations_does_not_include_revoked_allocations_in_returned_list(
    service,
    context,
    mock_users_db,
    proposal_accounts,
):
    user1, user2, _ = mock_users_db
    allocation = [
        AllocationDTO(proposal_accounts[0].address, 100),
        AllocationDTO(proposal_accounts[1].address, 200),
    ]
    database.allocations.add_all(
        context.epoch_details.epoch_num, user1.id, 0, allocation
    )
    database.allocations.add_all(
        context.epoch_details.epoch_num, user2.id, 0, allocation
    )

    expected_results = []
    for a in allocation:
        expected_results.append(
            ProposalDonationDTO(user2.address, a.amount, a.proposal_address)
        )

    database.allocations.soft_delete_all_by_epoch_and_user_id(
        context.epoch_details.epoch_num, user1.id
    )

    result = service.get_all_allocations(context)

    assert len(result) == 2
    for i in result:
        assert i in expected_results


def test_get_all_allocations_does_not_return_allocations_from_previous_and_future_epochs(
    service,
    context,
    mock_users_db,
    proposal_accounts,
):
    user1, _, _ = mock_users_db
    allocation = [
        AllocationDTO(proposal_accounts[0].address, 100),
        AllocationDTO(proposal_accounts[1].address, 200),
    ]
    database.allocations.add_all(
        context.epoch_details.epoch_num - 1, user1.id, 0, allocation
    )
    database.allocations.add_all(
        context.epoch_details.epoch_num + 1, user1.id, 1, allocation
    )

    assert service.get_all_allocations(context) == []


def test_get_all_with_allocation_amount_equal_0(
    service,
    context,
    mock_users_db,
    proposal_accounts,
):
    user1, _, _ = mock_users_db
    allocation = [
        AllocationDTO(proposal_accounts[0].address, 0),
    ]
    database.allocations.add_all(
        context.epoch_details.epoch_num, user1.id, 0, allocation
    )

    expected_result = [
        ProposalDonationDTO(user1.address, 0, proposal_accounts[0].address)
    ]
    assert service.get_all_allocations(context) == expected_result
