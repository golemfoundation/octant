from decimal import Decimal

import pytest
from eth_account import Account

from app.controllers.allocations import allocate, get_allocation_nonce
from app.controllers.rewards import (
    get_allocation_threshold,
    get_estimated_proposals_rewards,
)
from app.core.allocations import (
    AllocationRequest,
)
from app.core.rewards.rewards import (
    calculate_total_rewards,
    calculate_all_individual_rewards,
    calculate_matched_rewards_threshold,
)
from app.database.user import toggle_patron_mode
from app.extensions import db
from .conftest import (
    allocate_user_rewards,
    deserialize_allocations,
    MOCK_PROPOSALS,
    USER2_BUDGET,
    USER3_BUDGET,
)
from .test_allocations import (
    sign,
    create_payload,
    build_allocations_eip712_data,
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


@pytest.mark.parametrize(
    "eth_proceeds,locked_ratio,pending_epoch,expected",
    [
        (4_338473610_477382755, Decimal("0.0000004"), 1, 3_470778888_381905920),
        (4_338473610_477382755, Decimal("0.0000004"), 2, 2743891_635528535),
        (
            600_000000000_000000000,
            Decimal("0.0003298799699"),
            1,
            480_000000000_000000000,
        ),
        (
            600_000000000_000000000,
            Decimal("0.0003298799699"),
            2,
            10_897558862_607717064,
        ),
        (10_000000000_000000000, Decimal("0.2"), 1, 8_000000000_000000000),
        (10_000000000_000000000, Decimal("0.2"), 2, 4472135954999579392),
        (10_000000000_000000000, Decimal("0.2"), 3, 4472135954999579392),
        (10_000000000_000000000, Decimal("0.25"), 1, 8_000000000_000000000),
        (10_000000000_000000000, Decimal("0.25"), 2, 5_000000000_000000000),
        (10_000000000_000000000, Decimal("0.25"), 3, 5_000000000_000000000),
        (10_000000000_000000000, Decimal("0.43"), 1, 8_000000000_000000000),
        (10_000000000_000000000, Decimal("0.43"), 2, 6_557438524_302000652),
        (10_000000000_000000000, Decimal("0.43"), 3, 6_557438524_302000652),
        (1200_000000000_000000000, Decimal("1"), 1, 960_000000000_000000000),
        (1200_000000000_000000000, Decimal("1"), 2, 1200_000000000_000000000),
        (1200_000000000_000000000, Decimal("1"), 3, 1200_000000000_000000000),
    ],
)
def test_calculate_total_rewards(eth_proceeds, locked_ratio, pending_epoch, expected):
    result = calculate_total_rewards(eth_proceeds, locked_ratio, pending_epoch)
    assert result == expected


@pytest.mark.parametrize(
    "eth_proceeds,locked_ratio,pending_epoch,expected",
    [
        (4_338473610_477382755, Decimal("0.0000004"), 1, 2195113_308422828),
        (4_338473610_477382755, Decimal("0.0000004"), 2, 1735_389444190),
        (600_000000000_000000000, Decimal("0.0003298799699"), 1, 8_718047090_086173651),
        (600_000000000_000000000, Decimal("0.0003298799699"), 2, 197927981_940000000),
        (10_000000000_000000000, Decimal("0.2"), 1, 3_577708763_999663514),
        (10_000000000_000000000, Decimal("0.2"), 2, 2_000000000_000000000),
        (10_000000000_000000000, Decimal("0.2"), 3, 2_000000000_000000000),
        (10_000000000_000000000, Decimal("0.25"), 1, 4_000000000_000000000),
        (10_000000000_000000000, Decimal("0.25"), 2, 2_500000000_000000000),
        (10_000000000_000000000, Decimal("0.25"), 3, 2_500000000_000000000),
        (10_000000000_000000000, Decimal("0.43"), 1, 5_245950819_441600521),
        (10_000000000_000000000, Decimal("0.43"), 2, 4_300000000_000000000),
        (10_000000000_000000000, Decimal("0.43"), 3, 4_300000000_000000000),
        (1200_000000000_000000000, Decimal("1"), 1, 960_000000000_000000000),
        (1200_000000000_000000000, Decimal("1"), 2, 1200_000000000_000000000),
        (1200_000000000_000000000, Decimal("1"), 3, 1200_000000000_000000000),
    ],
)
def test_calculate_all_individual_rewards(
    eth_proceeds, locked_ratio, pending_epoch, expected
):
    result = calculate_all_individual_rewards(eth_proceeds, locked_ratio, pending_epoch)
    assert result == expected


def test_get_allocation_threshold(app, tos_users, proposal_accounts):
    total_allocated = _allocate_random_individual_rewards(tos_users, proposal_accounts)

    assert get_allocation_threshold(None) == calculate_matched_rewards_threshold(
        total_allocated, 5
    )


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
