import pytest

from app import exceptions
from app.legacy.controllers.allocations import allocate
from app.legacy.controllers.rewards import (
    get_allocation_threshold,
)
from app.legacy.core.allocations import AllocationRequest
from tests.conftest import (
    MOCK_EPOCHS,
    deserialize_allocations,
    MOCK_PROPOSALS,
)
from tests.legacy.test_allocations import (
    build_allocations_eip712_data,
    create_payload,
    sign,
)


@pytest.fixture(autouse=True)
def before(
    proposal_accounts,
    patch_epochs,
    patch_proposals,
    patch_has_pending_epoch_snapshot,
    patch_user_budget,
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
    allocate(
        AllocationRequest(payload1, signature1, override_existing_allocations=True)
    )
    allocate(
        AllocationRequest(payload2, signature2, override_existing_allocations=True)
    )

    allocations1 = sum([int(a.amount) for a in deserialize_allocations(payload1)])
    allocations2 = sum([int(a.amount) for a in deserialize_allocations(payload2)])

    return allocations1 + allocations2
