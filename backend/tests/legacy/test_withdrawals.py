import pytest

from app import db
from app.infrastructure import database
from app.legacy.controllers.withdrawals import get_withdrawable_eth
from app.legacy.core.allocations import Allocation
from tests.conftest import (
    MOCK_VAULT,
    mock_graphql,
    MOCK_EPOCHS,
    MOCKED_PENDING_EPOCH_NO,
    MOCK_GET_USER_BUDGET,
)


@pytest.fixture(autouse=True)
def before(mocker, app, graphql_client, patch_vault, patch_epochs):
    merkle_roots = [{"epoch": 1}, {"epoch": 2}, {"epoch": 3}, {"epoch": 4}]
    mock_graphql(mocker, merkle_roots_events=merkle_roots)


@pytest.mark.parametrize(
    #     The structure of these parameters is as follows
    #
    #     dict { int : List[(int, int, List(str))] }
    #             \             \   \      \___________ list of merkle proofs
    #              \             \   \_________________ reward amount
    #               \             \____________________ epoch number
    #                \
    #                 \______________________ account index of one of the accounts generated
    #                                         by user_accounts() fixture
    "expected_rewards",
    [
        # ------------------------------------
        (
            {
                0: [
                    (
                        1,
                        20000_000000000,
                        [
                            "0xf3da88ce132940aced09d7220c38d231e0adf28b6f7cbc1d358efc0e9fc41ebd"
                        ],
                    ),
                    (
                        2,
                        40000_000000000,
                        [
                            "0x625199059363058a4a29bed6b0a8f82d3b7e4698c41d565f65c1c93605fb70a8"
                        ],
                    ),
                ],
                1: [
                    (
                        1,
                        30000_000000000,
                        [
                            "0xb48f1d90532a935cc6ab465a845fd13f22ee7fb58c1fe279e2c36038aac85ccd"
                        ],
                    ),
                    (
                        2,
                        60000_000000000,
                        [
                            "0xc66896c2196622197df63c63c7f626b597bc305d35d1fd78813d2dcdc7313f6e"
                        ],
                    ),
                ],
            }
        ),
        # ------------------------------------
        (
            {
                0: [
                    (
                        1,
                        10000_000000000,
                        [
                            "0x6ec43b72d15d00ab268162d5e6af15f693c6d0caf93dfe664381753d463ad85a",
                            "0xf3da88ce132940aced09d7220c38d231e0adf28b6f7cbc1d358efc0e9fc41ebd",
                        ],
                    ),
                    (
                        2,
                        40000_000000000,
                        [
                            "0xd6c95435ed26baf36bd1c336338f749fee7e30094ea5ee7f95eee829214ae530",
                            "0x1f9f498784df87b93df88a813f7a02b3b73fcc621a0d1602199601146aafb8c2",
                        ],
                    ),
                ],
                1: [
                    (
                        1,
                        30000_000000000,
                        [
                            "0xbf8320ade05faf3ac755c43d87cc6b904767df9b265924a865801165117fb0b3"
                        ],
                    ),
                    (
                        2,
                        10000_000000000,
                        [
                            "0xc66896c2196622197df63c63c7f626b597bc305d35d1fd78813d2dcdc7313f6e",
                            "0x1f9f498784df87b93df88a813f7a02b3b73fcc621a0d1602199601146aafb8c2",
                        ],
                    ),
                    (
                        4,
                        60000_000000000,
                        [
                            "0x582a3b7c9ce265773e6a5fc188237fbad7d5bbfa076837f1b7f4308f864990f5",
                            "0x6f18eaeeb0361c5530c96c19850a9510c987f252ef7b6fab32b4a9c5463f8ce8",
                        ],
                    ),
                ],
                2: [
                    (
                        2,
                        50000_000000000,
                        [
                            "0x897f52d0675b4534d1dbbbb0c912dbb9a2c7677f224e1b41541a71b8c7b6ccb7",
                            "0x4ceb53828784b7a05e0ade5e6d77479163a5cca71f7fc3781c745cc21ba992c3",
                        ],
                    ),
                    (
                        3,
                        50000_000000000,
                        [
                            "0x40a412cca910411747e19bbb2fd15d39cd2bd04043be2fcd7cd6b88e05dad368"
                        ],
                    ),
                    (
                        4,
                        50000_000000000,
                        [
                            "0x1903e1f9d86fbf665a27334bc93e6eb7e55f41157fc4b32ad5c052da06067242"
                        ],
                    ),
                ],
                3: [
                    (
                        1,
                        10000_000000000,
                        [
                            "0x4ec277b40ceae243547922781f3a2424d555632e39018b10119283caa91d9daf",
                            "0xf3da88ce132940aced09d7220c38d231e0adf28b6f7cbc1d358efc0e9fc41ebd",
                        ],
                    ),
                    (
                        2,
                        20000_000000000,
                        [
                            "0x6f18eaeeb0361c5530c96c19850a9510c987f252ef7b6fab32b4a9c5463f8ce8",
                            "0x4ceb53828784b7a05e0ade5e6d77479163a5cca71f7fc3781c745cc21ba992c3",
                        ],
                    ),
                    (
                        3,
                        50000_000000000,
                        [
                            "0x6f18eaeeb0361c5530c96c19850a9510c987f252ef7b6fab32b4a9c5463f8ce8"
                        ],
                    ),
                    (
                        4,
                        80000_000000000,
                        [
                            "0x625199059363058a4a29bed6b0a8f82d3b7e4698c41d565f65c1c93605fb70a8",
                            "0x6f18eaeeb0361c5530c96c19850a9510c987f252ef7b6fab32b4a9c5463f8ce8",
                        ],
                    ),
                ],
            }
        ),
    ],
)
def test_get_withdrawable_eth(user_accounts, expected_rewards):
    MOCK_EPOCHS.get_pending_epoch.return_value = None

    # Populate db
    for user_index, rewards in expected_rewards.items():
        user_account = user_accounts[user_index].address

        for epoch, amount, _ in rewards:
            database.rewards.add_user_reward(epoch, user_account, amount)
        db.session.commit()

    # Asserts
    for user_index, rewards in expected_rewards.items():
        user_account = user_accounts[user_index].address
        result = get_withdrawable_eth(user_account)

        assert len(result) == len(rewards)
        for act, exp in zip(result, rewards):
            assert act.epoch == exp[0]
            assert act.amount == exp[1]
            assert act.proof == exp[2]


def test_get_withdrawable_eth_returns_only_user_not_claimed_rewards(user_accounts):
    MOCK_EPOCHS.get_pending_epoch.return_value = None
    MOCK_VAULT.get_last_claimed_epoch.return_value = 2

    database.rewards.add_user_reward(1, user_accounts[0].address, 100_000000000)
    database.rewards.add_user_reward(2, user_accounts[0].address, 200_000000000)
    database.rewards.add_user_reward(3, user_accounts[0].address, 300_000000000)
    database.rewards.add_user_reward(4, user_accounts[0].address, 400_000000000)
    db.session.commit()

    result = get_withdrawable_eth(user_accounts[0].address)

    assert len(result) == 2
    assert result[0].epoch == 3
    assert result[0].amount == 300_000000000
    assert result[1].epoch == 4
    assert result[1].amount == 400_000000000


def test_get_withdrawable_eth_returns_only_proposal_not_claimed_rewards(
    proposal_accounts,
):
    MOCK_EPOCHS.get_pending_epoch.return_value = None
    MOCK_VAULT.get_last_claimed_epoch.return_value = 2

    database.rewards.add_proposal_reward(
        1, proposal_accounts[0].address, 100_000000000, 50_000000000
    )
    database.rewards.add_proposal_reward(
        2, proposal_accounts[0].address, 200_000000000, 50_000000000
    )
    database.rewards.add_proposal_reward(
        3, proposal_accounts[0].address, 300_000000000, 50_000000000
    )
    database.rewards.add_proposal_reward(
        4, proposal_accounts[0].address, 400_000000000, 50_000000000
    )
    db.session.commit()

    result = get_withdrawable_eth(proposal_accounts[0].address)

    assert len(result) == 2
    assert result[0].epoch == 3
    assert result[0].amount == 300_000000000
    assert result[1].epoch == 4
    assert result[1].amount == 400_000000000


def test_get_withdrawable_eth_result_sorted_by_epochs(user_accounts):
    MOCK_EPOCHS.get_pending_epoch.return_value = None

    database.rewards.add_user_reward(2, user_accounts[0].address, 200_000000000)
    database.rewards.add_user_reward(4, user_accounts[0].address, 400_000000000)
    database.rewards.add_user_reward(1, user_accounts[0].address, 100_000000000)
    database.rewards.add_user_reward(3, user_accounts[0].address, 300_000000000)
    db.session.commit()

    result = get_withdrawable_eth(user_accounts[0].address)

    assert result[0].epoch == 1
    assert result[1].epoch == 2
    assert result[2].epoch == 3
    assert result[3].epoch == 4


def test_get_withdrawable_eth_in_pending_epoch_with_allocation(
    user_accounts, proposal_accounts, patch_user_budget
):
    MOCK_GET_USER_BUDGET.return_value = 1 * 10**18
    user = database.user.get_or_add_user(user_accounts[0].address)
    db.session.commit()

    user_allocations = [Allocation(proposal_accounts[0].address, 10_000000000)]
    database.allocations.add_all(MOCKED_PENDING_EPOCH_NO, user.id, 0, user_allocations)
    database.allocations.add_allocation_signature(
        user_accounts[0].address, MOCKED_PENDING_EPOCH_NO, 0, "0x00"
    )
    db.session.commit()

    result = get_withdrawable_eth(user_accounts[0].address)

    assert len(result) == 1
    assert result[0].epoch == 1
    assert result[0].amount == 999999990_000000000
    assert result[0].proof == []
    assert result[0].status == "pending"


def test_get_withdrawable_eth_in_pending_epoch_without_allocation(
    user_accounts, proposal_accounts
):
    database.user.add_user(user_accounts[0].address)
    db.session.commit()
    result = get_withdrawable_eth(user_accounts[0].address)

    assert len(result) == 1
    assert result[0].epoch == 1
    assert result[0].amount == 0
    assert result[0].proof == []
    assert result[0].status == "pending"


def test_get_withdrawable_eth_in_pending_epoch_in_epoch_3(
    user_accounts, proposal_accounts, patch_user_budget
):
    MOCK_EPOCHS.get_pending_epoch.return_value = 2
    MOCK_GET_USER_BUDGET.return_value = 1 * 10**18

    user = database.user.add_user(user_accounts[0].address)
    database.rewards.add_user_reward(1, user_accounts[0].address, 100_000000000)
    database.rewards.add_user_reward(1, user_accounts[1].address, 200_000000000)
    db.session.commit()

    user_allocations = [Allocation(proposal_accounts[0].address, 10_000000000)]
    database.allocations.add_all(
        MOCKED_PENDING_EPOCH_NO + 1, user.id, 0, user_allocations
    )
    database.allocations.add_allocation_signature(
        user_accounts[0].address, MOCKED_PENDING_EPOCH_NO + 1, 0, "0x00"
    )

    db.session.commit()

    result = get_withdrawable_eth(user_accounts[0].address)

    assert len(result) == 2
    assert result[0].epoch == 2
    assert result[0].amount == 999999990000000000
    assert result[0].proof == []
    assert result[0].status == "pending"

    assert result[1].epoch == 1
    assert result[1].amount == 100000000000
    assert result[1].proof == [
        "0xeba8e145c1102400c42b1fc5de1fea439aeaa93a6b46ef370ecbc8f15140a2dd"
    ]
    assert result[1].status == "available"


def test_get_withdrawable_eth_in_finalized_epoch_when_merkle_root_not_set_yet_epoch_1(
    mocker, user_accounts, proposal_accounts, patch_user_budget
):
    MOCK_EPOCHS.get_pending_epoch.return_value = None
    mock_graphql(mocker, merkle_roots_events=[])

    database.rewards.add_user_reward(1, user_accounts[0].address, 100_000000000)
    database.rewards.add_user_reward(1, user_accounts[1].address, 200_000000000)
    db.session.commit()

    result = get_withdrawable_eth(user_accounts[0].address)

    assert len(result) == 1
    assert result[0].epoch == 1
    assert result[0].amount == 100000000000
    assert result[0].proof == [
        "0xeba8e145c1102400c42b1fc5de1fea439aeaa93a6b46ef370ecbc8f15140a2dd"
    ]
    assert result[0].status == "pending"


def test_get_withdrawable_eth_in_finalized_epoch_when_merkle_root_not_set_yet_epoch_2(
    mocker, user_accounts, proposal_accounts, patch_user_budget
):
    MOCK_EPOCHS.get_pending_epoch.return_value = None
    mock_graphql(mocker, merkle_roots_events=[{"epoch": 1}])

    database.rewards.add_user_reward(1, user_accounts[0].address, 100_000000000)
    database.rewards.add_user_reward(1, user_accounts[1].address, 200_000000000)
    database.rewards.add_user_reward(2, user_accounts[0].address, 100_000000000)
    database.rewards.add_user_reward(2, user_accounts[1].address, 200_000000000)
    db.session.commit()

    result = get_withdrawable_eth(user_accounts[0].address)

    assert len(result) == 2
    assert result[0].epoch == 1
    assert result[0].amount == 100000000000
    assert result[0].proof == [
        "0xeba8e145c1102400c42b1fc5de1fea439aeaa93a6b46ef370ecbc8f15140a2dd"
    ]
    assert result[0].status == "available"

    assert result[1].epoch == 2
    assert result[1].amount == 100000000000
    assert result[1].proof == [
        "0xeba8e145c1102400c42b1fc5de1fea439aeaa93a6b46ef370ecbc8f15140a2dd"
    ]
    assert result[1].status == "pending"
