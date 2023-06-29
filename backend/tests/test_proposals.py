from unittest.mock import MagicMock, Mock

import pytest
from eth_account import Account

from app.contracts.epochs import Epochs
from app.contracts.proposals import Proposals
from app.core.proposals import get_proposal_rewards_above_threshold
from app.core.rewards import calculate_matched_rewards
from tests.conftest import allocate_user_rewards, MOCKED_PENDING_EPOCH_NO


@pytest.fixture(autouse=True)
def before(monkeypatch, proposal_accounts):
    mock_epochs = MagicMock(spec=Epochs)
    mock_proposals = MagicMock(spec=Proposals)
    mock_snapshotted = Mock()

    mock_epochs.get_pending_epoch.return_value = MOCKED_PENDING_EPOCH_NO
    mock_snapshotted.return_value = True

    mock_proposals.get_proposal_addresses.return_value = [
        p.address for p in proposal_accounts[0:5]
    ]

    monkeypatch.setattr(
        "app.core.allocations.has_pending_epoch_snapshot", mock_snapshotted
    )
    monkeypatch.setattr("app.core.allocations.proposals", mock_proposals)
    monkeypatch.setattr("app.core.allocations.epochs", mock_epochs)
    monkeypatch.setattr("app.core.proposals.proposals", mock_proposals)

    # Set some insanely high user rewards budget
    mock_get_user_budget = Mock()
    mock_get_user_budget.return_value = 10 * 10**18 * 10**18
    monkeypatch.setattr("app.core.allocations.get_budget", mock_get_user_budget)


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
    monkeypatch,
    user_accounts,
    proposal_accounts,
    user_allocations: dict,
    expected_rewards: dict,
):
    mock_matched_rewards = MagicMock(spec=calculate_matched_rewards)
    mock_matched_rewards.return_value = 10_000000000_000000000

    monkeypatch.setattr(
        "app.core.proposals.get_matched_rewards_from_epoch", mock_matched_rewards
    )

    for user_index, allocations in user_allocations.items():
        user_account = user_accounts[user_index]

        for allocation in allocations:
            proposal_account: Account = proposal_accounts[allocation[0]]
            allocation_amount = allocation[1]

            allocate_user_rewards(user_account, proposal_account, allocation_amount)

    expected = {}

    for proposal_index, expected_reward in expected_rewards.items():
        proposal_address = proposal_accounts[proposal_index].address
        expected[proposal_address] = expected_reward

    proposals_rewards, rewards_sum = get_proposal_rewards_above_threshold(
        MOCKED_PENDING_EPOCH_NO
    )
    assert len(proposals_rewards) == len(expected)

    for proposal in proposals_rewards:
        assert expected.get(proposal.address) == proposal.amount

    assert rewards_sum == sum(expected_rewards.values())
