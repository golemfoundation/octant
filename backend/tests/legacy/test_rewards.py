import pytest
from eth_account import Account
from freezegun import freeze_time

from app import exceptions
from app.extensions import db
from app.infrastructure import database
from app.legacy.controllers.allocations import allocate, get_allocation_nonce
from app.legacy.controllers.rewards import (
    get_allocation_threshold,
    get_estimated_proposals_rewards,
    get_finalized_epoch_proposals_rewards,
)
from app.legacy.controllers.snapshots import (
    snapshot_finalized_epoch,
)
from app.legacy.core.allocations import (
    AllocationRequest,
)
from app.legacy.core.rewards.rewards import (
    calculate_matched_rewards_threshold,
)
from app.legacy.core.user.patron_mode import toggle_patron_mode
from tests.conftest import (
    mock_graphql,
    allocate_user_rewards,
    deserialize_allocations,
    MOCK_PROPOSALS,
    MOCK_EPOCHS,
)
from tests.helpers import create_epoch_event
from tests.helpers.constants import USER2_BUDGET, USER3_BUDGET
from tests.legacy.test_allocations import (
    sign,
    create_payload,
    build_allocations_eip712_data,
)


@pytest.fixture(autouse=True)
def before(
    mocker,
    graphql_client,
    proposal_accounts,
    patch_epochs,
    patch_proposals,
    patch_has_pending_epoch_snapshot,
    patch_user_budget,
):
    MOCK_PROPOSALS.get_proposal_addresses.return_value = [
        p.address for p in proposal_accounts[0:5]
    ]

    epoch = create_epoch_event(start=1698802327, end=1698803327, duration=1000, epoch=1)

    mock_graphql(mocker, epochs_events=[epoch])


def test_get_allocation_threshold(app, tos_users, proposal_accounts):
    total_allocated = _allocate_random_individual_rewards(tos_users, proposal_accounts)

    assert get_allocation_threshold(None) == calculate_matched_rewards_threshold(
        total_allocated, 5
    )


def test_get_allocation_threshold_raises_when_not_in_allocation_period(app):
    MOCK_EPOCHS.get_pending_epoch.return_value = None

    with pytest.raises(exceptions.NotInDecisionWindow):
        get_allocation_threshold(None)


@pytest.mark.parametrize(
    #     The structure of these parameters is as follows
    #
    #     dict { int : List[(str, int)] }
    #             \           \     \______ allocation amount
    #              \           \___________ account index of one of the accounts generated
    #               \                       by proposal_accounts() fixture
    #                \_____________________ account index of one of the accounts generated
    #                                       by user_accounts() fixture
    #
    #     dict { int : int }
    #             \      \__________________ calculated matched reward for the proposal
    #              \________________________ account index of one of the accounts generated
    #                                        by proposal_accounts() fixture
    "user_allocations, expected_matches",
    [
        (
            {
                0: [
                    (1, 3_000000000_000000000),
                    (2, 1_000000000_000000000),
                    (3, 1_000000000_000000000),
                ],
                1: [(1, 2_000000000_000000000), (3, 4_000000000_000000000)],
            },
            {
                1: 5_000000000_000000000,
                2: 0,
                3: 5_000000000_000000000,
            },
        ),
        # ------------------------------------
        (
            {
                0: [
                    (1, 3_000000000_000000000),
                    (2, 2_000000000_000000000),
                    (3, 1_000000000_000000000),
                ],
                1: [(1, 2_000000000_000000000), (3, 4_000000000_000000000)],
            },
            {
                1: 4_166666666_666666666,
                2: 1_666666666_666666666,
                3: 4_166666666_666666666,
            },
        ),
    ],
)
def test_proposals_rewards_without_patrons(
    app,
    patch_matched_rewards,
    tos_users,
    proposal_accounts,
    user_allocations: dict,
    expected_matches: dict,
):
    for user_index, allocations in user_allocations.items():
        user_account = tos_users[user_index]

        for allocation in allocations:
            proposal_account: Account = proposal_accounts[allocation[0]]
            allocation_amount = allocation[1]

            nonce = get_allocation_nonce(user_account.address)
            allocate_user_rewards(
                user_account, proposal_account, allocation_amount, nonce
            )

    expected_rewards = {}

    for proposal_index, expected_reward in expected_matches.items():
        proposal_address = proposal_accounts[proposal_index].address
        expected_rewards[proposal_address] = expected_reward

    proposals = get_estimated_proposals_rewards()
    assert len(proposals) == 5
    for proposal in proposals:
        assert expected_rewards.get(proposal.address, 0) == proposal.matched


def test_estimated_proposal_rewards_when_allocation_has_0_value(
    app, mock_pending_epoch_snapshot_db, tos_users, proposal_accounts
):
    user = tos_users[0]
    proposal = proposal_accounts[0]
    allocate_user_rewards(user, proposal, 0, 0)

    result = get_estimated_proposals_rewards()

    assert len(result) == 5
    for proposal in result:
        assert proposal.allocated == 0
        assert proposal.matched == 0


def test_estimated_proposal_rewards_raises_when_not_in_allocation_period(app):
    MOCK_EPOCHS.get_pending_epoch.return_value = None

    with pytest.raises(exceptions.NotInDecisionWindow):
        get_estimated_proposals_rewards()


@freeze_time("2023-11-01 01:48:47")
def test_proposals_rewards_with_patron(
    app, mock_pending_epoch_snapshot_db, tos_users, proposal_accounts
):
    allocate_amount = 1 * 10**9
    matched_before_patron = 220_114398315_501248407
    patron_budget = USER2_BUDGET
    user = tos_users[0]
    patron = tos_users[1]
    proposal = proposal_accounts[0]
    nonce = get_allocation_nonce(user.address)
    allocate_user_rewards(user, proposal, allocate_amount, nonce)

    result_before_patron_mode_enabled = get_estimated_proposals_rewards()
    assert result_before_patron_mode_enabled[0].allocated == allocate_amount
    assert result_before_patron_mode_enabled[0].matched == matched_before_patron

    toggle_patron_mode(patron.address)
    db.session.commit()

    result_after_patron_mode_enabled = get_estimated_proposals_rewards()
    assert result_after_patron_mode_enabled[0].allocated == allocate_amount
    assert (
        result_after_patron_mode_enabled[0].matched
        == matched_before_patron + patron_budget
    )


@freeze_time("2023-11-01 01:48:47")
def test_proposals_rewards_with_multiple_patrons(
    app, mock_pending_epoch_snapshot_db, tos_users, proposal_accounts
):
    allocate_amount = 1 * 10**9
    matched_before_patrons = 220_114398315_501248407
    patron1_budget = USER2_BUDGET
    patron2_budget = USER3_BUDGET
    user = tos_users[0]
    patron1 = tos_users[1]
    patron2 = tos_users[2]
    proposal = proposal_accounts[0]
    nonce = get_allocation_nonce(user.address)
    allocate_user_rewards(user, proposal, allocate_amount, nonce)

    toggle_patron_mode(patron1.address)
    toggle_patron_mode(patron2.address)
    db.session.commit()

    result_after_patron_mode_enabled = get_estimated_proposals_rewards()
    assert result_after_patron_mode_enabled[0].allocated == allocate_amount
    assert (
        result_after_patron_mode_enabled[0].matched
        == matched_before_patrons + patron1_budget + patron2_budget
    )


@freeze_time("2023-11-01 01:48:47")
def test_finalized_epoch_proposal_rewards_with_patrons_enabled(
    user_accounts, proposal_accounts, mock_pending_epoch_snapshot_db
):
    user1_allocation = 1000_000000000
    user2_allocation = 2000_000000000

    toggle_patron_mode(user_accounts[2].address)
    db.session.commit()

    allocate_user_rewards(user_accounts[0], proposal_accounts[0], user1_allocation)
    allocate_user_rewards(user_accounts[1], proposal_accounts[1], user2_allocation)

    epoch = snapshot_finalized_epoch()
    assert epoch == 1

    all_rewards = database.rewards.get_by_epoch(epoch)
    assert len(all_rewards) == 4

    proposal_rewards = get_finalized_epoch_proposals_rewards(epoch)
    assert len(proposal_rewards) == 2

    assert proposal_rewards[0].address == proposal_accounts[1].address
    assert proposal_rewards[0].allocated == 2_000_000_000_000
    assert proposal_rewards[0].matched == 146_744289427_163382529
    assert proposal_rewards[1].address == proposal_accounts[0].address
    assert proposal_rewards[1].allocated == 1_000_000_000_000
    assert proposal_rewards[1].matched == 73_372144713_581691264


@freeze_time("2023-11-01 01:48:47")
def test_cannot_get_proposal_rewards_when_snapshot_not_taken(
    user_accounts, proposal_accounts, mock_pending_epoch_snapshot_db
):
    user1_allocation = 1000_000000000
    user2_allocation = 2000_000000000

    toggle_patron_mode(user_accounts[2].address)
    db.session.commit()

    allocate_user_rewards(user_accounts[0], proposal_accounts[0], user1_allocation)
    allocate_user_rewards(user_accounts[1], proposal_accounts[1], user2_allocation)

    with pytest.raises(exceptions.MissingSnapshot):
        get_finalized_epoch_proposals_rewards(1)

    epoch = snapshot_finalized_epoch()
    assert epoch == 1

    rewards = get_finalized_epoch_proposals_rewards(1)

    assert len(rewards) != 0


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
