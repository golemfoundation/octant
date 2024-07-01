import pytest

from app.infrastructure import database
from app.modules.user.allocations.nonce.service.saved import SavedUserAllocationsNonce
from tests.helpers.allocations import mock_request


@pytest.fixture(autouse=True)
def before(app):
    pass


@pytest.fixture()
def service():
    return SavedUserAllocationsNonce()


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

    database.allocations.store_allocation_request(alice.address, 0, mock_request(0))
    new_nonce = service.get_user_next_nonce(alice.address)

    assert new_nonce == 1

    database.allocations.store_allocation_request(
        alice.address, 0, mock_request(new_nonce)
    )
    new_nonce = service.get_user_next_nonce(alice.address)

    assert new_nonce == 2


def test_user_nonce_changes_increases_at_each_allocation_request_for_each_user(
    service, mock_users_db
):
    alice, bob, carol = mock_users_db

    for i in range(0, 5):
        database.allocations.store_allocation_request(alice.address, 0, mock_request(i))
        next_user_nonce = service.get_user_next_nonce(alice.address)
        assert next_user_nonce == i + 1

        # for other users, nonces do not change
        assert service.get_user_next_nonce(bob.address) == 0
        assert service.get_user_next_nonce(carol.address) == 0

    for i in range(0, 4):
        database.allocations.store_allocation_request(bob.address, 0, mock_request(i))
        next_user_nonce = service.get_user_next_nonce(bob.address)
        assert next_user_nonce == i + 1

        # for other users, nonces do not change
        assert service.get_user_next_nonce(alice.address) == 5
        assert service.get_user_next_nonce(carol.address) == 0

    for i in range(0, 3):
        database.allocations.store_allocation_request(carol.address, 0, mock_request(i))
        next_user_nonce = service.get_user_next_nonce(carol.address)
        assert next_user_nonce == i + 1

        # for other users, nonces do not change
        assert service.get_user_next_nonce(alice.address) == 5
        assert service.get_user_next_nonce(bob.address) == 4


def test_user_nonce_is_continuous_despite_epoch_changes(service, mock_users_db):
    alice, _, _ = mock_users_db

    database.allocations.store_allocation_request(alice.address, 1, mock_request(0))
    new_nonce = service.get_user_next_nonce(alice.address)
    assert new_nonce == 1

    database.allocations.store_allocation_request(
        alice.address, 2, mock_request(new_nonce)
    )
    new_nonce = service.get_user_next_nonce(alice.address)
    assert new_nonce == 2

    database.allocations.store_allocation_request(
        alice.address, 10, mock_request(new_nonce)
    )
    new_nonce = service.get_user_next_nonce(alice.address)
    assert new_nonce == 3
