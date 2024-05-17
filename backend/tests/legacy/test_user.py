import pytest

from app import exceptions
from app.extensions import db
from app.infrastructure import database
from app.modules.dto import (
    AllocationItem,
    UserAllocationPayload,
    UserAllocationRequestPayload,
)
from app.modules.user.allocations import controller as allocations_controller
from app.legacy.controllers.user import (
    get_patron_mode_status,
    toggle_patron_mode,
)
from app.legacy.core.user.budget import get_budget
from tests.conftest import (
    MOCKED_PENDING_EPOCH_NO,
    USER1_BUDGET,
    MOCK_EPOCHS,
)


@pytest.fixture(autouse=True)
def before(app, patch_epochs, patch_projects, patch_is_contract, mock_epoch_details):
    pass


@pytest.fixture()
def make_allocations(app, project_accounts):
    def make_allocations(user, epoch):
        nonce = allocations_controller.get_user_next_nonce(user.address)

        allocation_items = [
            AllocationItem(project_accounts[0].address, 10 * 10**18),
            AllocationItem(project_accounts[1].address, 20 * 10**18),
            AllocationItem(project_accounts[2].address, 30 * 10**18),
        ]

        request = UserAllocationRequestPayload(
            payload=UserAllocationPayload(allocations=allocation_items, nonce=nonce),
            signature="0xdeadbeef",
        )

        database.allocations.store_allocation_request(user.address, epoch, request)

        db.session.commit()

    return make_allocations


def test_get_user_budget(user_accounts, mock_pending_epoch_snapshot_db):
    expected_result = USER1_BUDGET
    result = get_budget(user_accounts[0].address, MOCKED_PENDING_EPOCH_NO)

    assert result == expected_result


def test_get_patron_mode_status_return_false_when_user_does_not_exist(user_accounts):
    result = get_patron_mode_status(user_accounts[0].address)
    assert result is False


def test_patron_mode_status_toggle_raises_error_when_user_does_not_exist(user_accounts):
    with pytest.raises(exceptions.UserNotFound):
        toggle_patron_mode(user_accounts[0].address, "abcd")


def test_patron_mode_status_toggle_raises_error_when_signature_is_invalid(
    user_accounts,
):
    invalid_sig = "ab181bbf991fca4134510f6d79df07f2e5f6ea5a2b3326b955dbc6b3e4c4dfd1444cd94aaa4c08e80843b2e8f9caef09298f38b3a5b3358de58ffa9a3b4313c91b"
    database.user.add_user(user_accounts[0].address)
    with pytest.raises(exceptions.InvalidSignature):
        toggle_patron_mode(user_accounts[0].address, invalid_sig)


def test_patron_mode_status_toggle(user_accounts):
    database.user.add_user(user_accounts[0].address)
    status = get_patron_mode_status(user_accounts[0].address)
    assert status is False

    toggle_true_sig = "52d249ca8ac8f40c01613635dac8a9b01eb50230ad1467451a058170726650b92223e80032a4bff4d25c3554e9d1347043c53b4c2dc9f1ba3f071bd3a1c8b9121b"
    toggle_patron_mode(user_accounts[0].address, toggle_true_sig)
    status = get_patron_mode_status(user_accounts[0].address)
    assert status is True

    toggle_false_sig = "979b997cb2b990f104ed4d342a364207a019649eda00497780033d154ee07c44141a6be33cecdde879b1b4238c1622660e70baddb745def53d6733e4aacaeb181b"
    toggle_patron_mode(user_accounts[0].address, toggle_false_sig)
    status = get_patron_mode_status(user_accounts[0].address)
    assert status is False


def test_patron_mode_toggle_fails_when_use_sig_to_enable_for_disable(user_accounts):
    database.user.add_user(user_accounts[0].address)
    toggle_false_sig = "979b997cb2b990f104ed4d342a364207a019649eda00497780033d154ee07c44141a6be33cecdde879b1b4238c1622660e70baddb745def53d6733e4aacaeb181b"
    with pytest.raises(exceptions.InvalidSignature):
        toggle_patron_mode(user_accounts[0].address, toggle_false_sig)


def test_patron_mode_toggle_fails_when_use_sig_to_disable_for_enable(user_accounts):
    database.user.add_user(user_accounts[0].address)
    toggle_true_sig = "52d249ca8ac8f40c01613635dac8a9b01eb50230ad1467451a058170726650b92223e80032a4bff4d25c3554e9d1347043c53b4c2dc9f1ba3f071bd3a1c8b9121b"
    toggle_patron_mode(user_accounts[0].address, toggle_true_sig)

    with pytest.raises(exceptions.InvalidSignature):
        toggle_patron_mode(user_accounts[0].address, toggle_true_sig)


def test_patron_mode_revokes_allocations_for_the_epoch(
    alice, make_allocations, mock_pending_epoch_snapshot_db
):
    toggle_true_sig = "52d249ca8ac8f40c01613635dac8a9b01eb50230ad1467451a058170726650b92223e80032a4bff4d25c3554e9d1347043c53b4c2dc9f1ba3f071bd3a1c8b9121b"
    make_allocations(alice, MOCKED_PENDING_EPOCH_NO)
    allocations, _ = allocations_controller.get_last_user_allocation(
        alice.address, MOCKED_PENDING_EPOCH_NO
    )
    assert len(allocations) == 3

    toggle_patron_mode(alice.address, toggle_true_sig)

    user_active_allocations, _ = allocations_controller.get_last_user_allocation(
        alice.address, MOCKED_PENDING_EPOCH_NO
    )
    assert len(user_active_allocations) == 0


def test_when_patron_mode_changes_revoked_allocations_are_not_restored(
    alice, make_allocations, mock_pending_epoch_snapshot_db
):
    toggle_true_sig = "52d249ca8ac8f40c01613635dac8a9b01eb50230ad1467451a058170726650b92223e80032a4bff4d25c3554e9d1347043c53b4c2dc9f1ba3f071bd3a1c8b9121b"
    toggle_false_sig = "979b997cb2b990f104ed4d342a364207a019649eda00497780033d154ee07c44141a6be33cecdde879b1b4238c1622660e70baddb745def53d6733e4aacaeb181b"
    make_allocations(alice, MOCKED_PENDING_EPOCH_NO)

    toggle_patron_mode(alice.address, toggle_true_sig)
    toggle_patron_mode(alice.address, toggle_false_sig)

    user_active_allocations, _ = allocations_controller.get_last_user_allocation(
        alice.address, MOCKED_PENDING_EPOCH_NO
    )
    assert len(user_active_allocations) == 0


@pytest.mark.skip("Cannot create epoch context for epoch 0")
def test_patron_mode_does_not_revoke_allocations_from_previous_epochs(
    alice, make_allocations, mock_pending_epoch_snapshot_db
):
    toggle_true_sig = "52d249ca8ac8f40c01613635dac8a9b01eb50230ad1467451a058170726650b92223e80032a4bff4d25c3554e9d1347043c53b4c2dc9f1ba3f071bd3a1c8b9121b"
    make_allocations(alice, MOCKED_PENDING_EPOCH_NO - 1)
    make_allocations(alice, MOCKED_PENDING_EPOCH_NO)

    user_active_allocations_pre, _ = allocations_controller.get_last_user_allocation(
        alice.address, MOCKED_PENDING_EPOCH_NO
    )
    (
        user_prev_epoch_allocations_pre,
        _,
    ) = allocations_controller.get_last_user_allocation(
        alice.address, MOCKED_PENDING_EPOCH_NO - 1
    )

    assert len(user_active_allocations_pre) == 3
    assert len(user_prev_epoch_allocations_pre) == 3

    toggle_patron_mode(alice.address, toggle_true_sig)

    user_active_allocations_post, _ = allocations_controller.get_last_user_allocation(
        alice.address, MOCKED_PENDING_EPOCH_NO
    )
    (
        user_prev_epoch_allocations_post,
        _,
    ) = allocations_controller.get_last_user_allocation(
        alice.address, MOCKED_PENDING_EPOCH_NO - 1
    )

    assert user_active_allocations_post != user_active_allocations_pre
    assert user_prev_epoch_allocations_post == user_prev_epoch_allocations_pre


def test_patron_mode_can_be_toggled_outside_allocation_period(user_accounts):
    MOCK_EPOCHS.get_pending_epoch.return_value = None

    database.user.add_user(user_accounts[0].address)
    toggle_true_sig = "52d249ca8ac8f40c01613635dac8a9b01eb50230ad1467451a058170726650b92223e80032a4bff4d25c3554e9d1347043c53b4c2dc9f1ba3f071bd3a1c8b9121b"
    toggle_patron_mode(user_accounts[0].address, toggle_true_sig)

    status = get_patron_mode_status(user_accounts[0].address)

    assert status is True
