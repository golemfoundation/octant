import pytest

from app.extensions import db
from app.infrastructure import database
from app.modules.dto import AllocationDTO
from app.modules.user.allocations.service.saved import SavedUserAllocations
from tests.helpers.context import get_context


@pytest.fixture(autouse=True)
def before(app):
    pass


def test_get_all_donors_addresses(mock_users_db, proposal_accounts):
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

    service = SavedUserAllocations()

    result_epoch_1 = service.get_all_donors_addresses(context_epoch_1)
    result_epoch_2 = service.get_all_donors_addresses(context_epoch_2)

    assert result_epoch_1 == [user1.address, user2.address]
    assert result_epoch_2 == [user3.address]


def test_return_only_not_removed_allocations(mock_users_db, proposal_accounts):
    user1, user2, _ = mock_users_db

    allocation = [
        AllocationDTO(proposal_accounts[0].address, 100),
    ]

    database.allocations.add_all(1, user1.id, 0, allocation)
    database.allocations.add_all(1, user2.id, 0, allocation)
    database.allocations.soft_delete_all_by_epoch_and_user_id(1, user2.id)
    db.session.commit()

    context = get_context(1)

    service = SavedUserAllocations()

    result = service.get_all_donors_addresses(context)

    assert result == [user1.address]


def test_get_user_allocation_sum(context, mock_users_db, proposal_accounts):
    user1, user2, _ = mock_users_db
    allocation = [
        AllocationDTO(proposal_accounts[0].address, 100),
        AllocationDTO(proposal_accounts[1].address, 200),
    ]
    database.allocations.add_all(1, user1.id, 0, allocation)
    database.allocations.add_all(1, user2.id, 0, allocation)
    db.session.commit()

    service = SavedUserAllocations()

    result = service.get_user_allocation_sum(context, user1.address)

    assert result == 300


def test_has_user_allocated_rewards(context, mock_users_db, proposal_accounts):
    user1, _, _ = mock_users_db
    database.allocations.add_allocation_request(user1.address, 1, 0, "0x00", False)

    db.session.commit()

    service = SavedUserAllocations()

    result = service.has_user_allocated_rewards(context, user1.address)

    assert result is True


def test_has_user_allocated_rewards_returns_false(
    context, mock_users_db, proposal_accounts
):
    user1, _, _ = mock_users_db
    service = SavedUserAllocations()

    result = service.has_user_allocated_rewards(context, user1.address)

    assert result is False
