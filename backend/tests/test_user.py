import pytest
from eth_account import Account

from app.core.user import get_budget, get_claimed_rewards
from app.controllers.allocations import get_allocation_nonce
from tests.conftest import allocate_user_rewards, MOCKED_PENDING_EPOCH_NO


@pytest.fixture(autouse=True)
def before(patch_epochs, patch_proposals):
    pass


def test_get_user_budget(user_accounts, mock_pending_epoch_snapshot_db):
    expected_result = 603616_460640476

    result = get_budget(user_accounts[0].address, MOCKED_PENDING_EPOCH_NO)

    assert result == expected_result


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
    #             \      \__________________ user claimed rewards
    #              \________________________ account index of one of the accounts generated
    #                                        by proposal_accounts() fixture
    "user_allocations, expected_rewards",
    [
        (
            {
                0: [
                    (1, 300000_000000000),
                    (2, 100000_000000000),
                    (3, 100000_000000000),
                ],
                1: [(1, 200000_000000000), (3, 400000_000000000)],
            },
            {
                0: 103616_460640476,
                1: 2418082_191780824,
            },
        ),
        # ------------------------------------
        (
            {
                0: [(1, 603616_460640476)],
                1: [(2, 0)],
            },
            {
                1: 3018082_191780824,
            },
        ),
    ],
)
def test_get_claimed_rewards(
    user_accounts,
    proposal_accounts,
    mock_pending_epoch_snapshot_db,
    user_allocations: dict,
    expected_rewards: dict,
):
    for user_index, allocations in user_allocations.items():
        user_account = user_accounts[user_index]

        for allocation in allocations:
            proposal_account: Account = proposal_accounts[allocation[0]]
            allocation_amount = allocation[1]

            nonce = get_allocation_nonce(user_account.address)
            allocate_user_rewards(
                user_account, proposal_account, allocation_amount, nonce
            )

    expected = {}

    for user_index, expected_reward in expected_rewards.items():
        user_address = user_accounts[user_index].address
        expected[user_address] = expected_reward

    user_rewards, rewards_sum = get_claimed_rewards(MOCKED_PENDING_EPOCH_NO)
    assert len(user_rewards) == len(expected)
    for user in user_rewards:
        assert expected.get(user.address) == user.amount

    assert rewards_sum == sum(expected_rewards.values())
