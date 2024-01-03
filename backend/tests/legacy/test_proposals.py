import pytest
from eth_account import Account

from app.legacy.controllers.allocations import get_allocation_nonce
from app.legacy.core.proposals import get_proposal_rewards_above_threshold
from tests.conftest import (
    allocate_user_rewards,
    MOCKED_PENDING_EPOCH_NO,
    MOCK_PROPOSALS,
)


@pytest.fixture(autouse=True)
def before(
    proposal_accounts,
    patch_epochs,
    patch_proposals,
    patch_has_pending_epoch_snapshot,
    patch_user_budget,
    patch_matched_rewards,
):
    MOCK_PROPOSALS.get_proposal_addresses.return_value = [
        p.address for p in proposal_accounts[0:5]
    ]


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
    #             \      \__________________ calculated total reward for the proposal
    #              \________________________ account index of one of the accounts generated
    #                                        by proposal_accounts() fixture
    "user_allocations, expected_rewards",
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
                1: 10_000000000_000000000,
                3: 10_000000000_000000000,
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
                1: 9_166666666_666666666,
                2: 3_666666666_666666666,
                3: 9_166666666_666666666,
            },
        ),
    ],
)
def test_proposals_rewards_above_threshold(
    app,
    tos_users,
    proposal_accounts,
    user_allocations: dict,
    expected_rewards: dict,
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

    expected = {}

    for proposal_index, expected_reward in expected_rewards.items():
        proposal_address = proposal_accounts[proposal_index].address
        expected[proposal_address] = expected_reward

    (
        proposals_rewards,
        rewards_sum,
        matched_rewards,
    ) = get_proposal_rewards_above_threshold(MOCKED_PENDING_EPOCH_NO)
    assert len(proposals_rewards) == len(expected)

    for proposal in proposals_rewards:
        assert expected.get(proposal.address) == proposal.amount

    assert rewards_sum == sum(expected_rewards.values())
    assert sum([proposal.matched for proposal in proposals_rewards]) == pytest.approx(
        matched_rewards, 0.000000000000000001
    )
