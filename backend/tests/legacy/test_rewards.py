import pytest

from app import exceptions
from app.legacy.controllers.rewards import (
    get_allocation_threshold,
)
from app.legacy.crypto.eip712 import build_allocations_eip712_data, sign
from app.modules.user.allocations import controller as new_controller
from app.modules.user.allocations.controller import allocate
from tests.conftest import (
    MOCK_EPOCHS,
    MOCK_PROPOSALS,
)
from tests.helpers.allocations import create_payload, deserialize_allocations


def get_allocation_nonce(user_address):
    return new_controller.get_user_next_nonce(user_address)


@pytest.fixture(autouse=True)
def before(
    proposal_accounts,
    mock_epoch_details,
    patch_epochs,
    patch_proposals,
    patch_has_pending_epoch_snapshot,
    patch_user_budget,
    patch_is_contract,
):
    MOCK_PROPOSALS.get_proposal_addresses.return_value = [
        p.address for p in proposal_accounts[0:5]
    ]


def test_get_allocation_threshold(app, tos_users, proposal_accounts):
    total_allocated = _allocate_random_individual_rewards(tos_users, proposal_accounts)

    assert get_allocation_threshold(None) == int(total_allocated / 10)


def test_get_allocation_threshold_raises_when_not_in_allocation_period(app):
    MOCK_EPOCHS.get_pending_epoch.return_value = None

    with pytest.raises(exceptions.NotInDecisionWindow):
        get_allocation_threshold(None)


def _allocate_random_individual_rewards(user_accounts, proposal_accounts) -> int:
    """
    Allocates individual rewards from 2 users for 5 projects total

    Returns the sum of these allocations
    """
    payload1 = create_payload(proposal_accounts[0:2], None, 0)
    signature1 = sign(user_accounts[0], build_allocations_eip712_data(payload1))

    payload2 = create_payload(proposal_accounts[0:3], None, 0)
    signature2 = sign(user_accounts[1], build_allocations_eip712_data(payload2))

    # Call allocate method for both users
    allocate(user_accounts[0].address, {"payload": payload1, "signature": signature1})
    allocate(user_accounts[1].address, {"payload": payload2, "signature": signature2})

    allocations1 = sum([int(a.amount) for a in deserialize_allocations(payload1)])
    allocations2 = sum([int(a.amount) for a in deserialize_allocations(payload2)])

    return allocations1 + allocations2
