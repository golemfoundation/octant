import pytest
from eth_account import Account
from freezegun import freeze_time

from app import exceptions
from app.extensions import db
from app.legacy.controllers.allocations import allocate, get_allocation_nonce
from app.legacy.controllers.rewards import (
    get_allocation_threshold,
)
from app.legacy.core.allocations import AllocationRequest
from app.legacy.core.user.patron_mode import toggle_patron_mode
from app.modules.project_rewards.controller import get_estimated_project_rewards
from tests.conftest import (
    MOCK_EPOCHS,
    MOCK_PROPOSALS,
    allocate_user_rewards,
    deserialize_allocations,
    mock_graphql,
)
from tests.helpers import create_epoch_event
from tests.helpers.constants import (
    MOCKED_PENDING_EPOCH_NO,
    USER2_BUDGET,
    USER3_BUDGET,
)
from tests.helpers.pending_snapshot import create_pending_snapshot
from tests.legacy.test_allocations import (
    build_allocations_eip712_data,
    create_payload,
    sign,
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


@pytest.fixture(scope="function")
def mock_pending_epoch_snapshot_db(app, mock_users_db):
    create_pending_snapshot(
        epoch_nr=MOCKED_PENDING_EPOCH_NO, mock_users_db=mock_users_db
    )


def test_get_allocation_threshold(app, tos_users, proposal_accounts):
    total_allocated = _allocate_random_individual_rewards(tos_users, proposal_accounts)

    assert get_allocation_threshold(None) == int(total_allocated / 10)


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
                1: 110057199157750624203,
                2: 0,
                3: 110057199157750624203,
            },
        ),
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
                1: 91714332631458853502,
                2: 36685733052583541401,
                3: 91714332631458853502,
            },
        ),
    ],
)
def test_project_rewards_without_patrons(
    app,
    mock_pending_epoch_snapshot_db,
    tos_users,
    proposal_accounts,
    user_allocations: dict,
    expected_matches: dict,
    patch_etherscan_get_block_api,
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

    project_rewards = get_estimated_project_rewards().rewards
    assert len(project_rewards) == 5
    for project_reward in project_rewards:
        assert expected_rewards.get(project_reward.address, 0) == project_reward.matched


def test_estimated_proposal_rewards_when_allocation_has_0_value(
    app,
    mock_pending_epoch_snapshot_db,
    tos_users,
    proposal_accounts,
    patch_etherscan_get_block_api,
):
    user = tos_users[0]
    proposal = proposal_accounts[0]
    allocate_user_rewards(user, proposal, 0, 0)

    result = get_estimated_project_rewards().rewards

    assert len(result) == 5
    for proposal in result:
        assert proposal.allocated == 0
        assert proposal.matched == 0


def test_estimated_proposal_rewards_raises_when_not_in_allocation_period(app):
    MOCK_EPOCHS.get_pending_epoch.return_value = None

    with pytest.raises(exceptions.InvalidEpoch):
        get_estimated_project_rewards()


@freeze_time("2023-11-01 01:48:47")
def test_proposals_rewards_with_patron(
    app,
    mock_pending_epoch_snapshot_db,
    tos_users,
    proposal_accounts,
    patch_etherscan_get_block_api,
):
    allocate_amount = 1 * 10**9
    matched_before_patron = 220_114398315_501248407
    patron_budget = USER2_BUDGET
    user = tos_users[0]
    patron = tos_users[1]
    proposal = proposal_accounts[0]
    nonce = get_allocation_nonce(user.address)
    allocate_user_rewards(user, proposal, allocate_amount, nonce)

    result_before_patron_mode_enabled = get_estimated_project_rewards().rewards
    assert result_before_patron_mode_enabled[0].allocated == allocate_amount
    assert result_before_patron_mode_enabled[0].matched == matched_before_patron

    toggle_patron_mode(patron.address)
    db.session.commit()

    result_after_patron_mode_enabled = get_estimated_project_rewards().rewards
    assert result_after_patron_mode_enabled[0].allocated == allocate_amount
    assert (
        result_after_patron_mode_enabled[0].matched
        == matched_before_patron + patron_budget
    )


@freeze_time("2023-11-01 01:48:47")
def test_proposals_rewards_with_multiple_patrons(
    app,
    mock_pending_epoch_snapshot_db,
    tos_users,
    proposal_accounts,
    patch_etherscan_get_block_api,
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

    result_after_patron_mode_enabled = get_estimated_project_rewards().rewards
    assert result_after_patron_mode_enabled[0].allocated == allocate_amount
    assert (
        result_after_patron_mode_enabled[0].matched
        == matched_before_patrons + patron1_budget + patron2_budget
    )


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
