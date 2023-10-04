import pytest
from eth_account import Account
from freezegun import freeze_time

from app import exceptions
from app.constants import GLM_TOTAL_SUPPLY_WEI
from app.controllers.user import MAX_DAYS_TO_ESTIMATE_BUDGET
from app.core.user.budget import get_budget, estimate_budget
from app.core.user.rewards import get_claimed_rewards
from app.controllers import user as user_controller
from tests.conftest import (
    allocate_user_rewards,
    MOCKED_PENDING_EPOCH_NO,
    mock_graphql,
    create_epoch_event,
    MOCK_EPOCHS,
    create_deposit_event,
)
from app.controllers.allocations import get_allocation_nonce


@pytest.fixture(autouse=True)
def before(patch_epochs, patch_proposals):
    pass


def test_get_user_budget(user_accounts, mock_pending_epoch_snapshot_db):
    expected_result = 603616_460640476

    result = get_budget(user_accounts[0].address, MOCKED_PENDING_EPOCH_NO)

    assert result == expected_result


@pytest.mark.parametrize(
    "days,amount,expected",
    [
        (0, 0, 0),
        (15, 90, 0),
        (15, 1000_000000000_000000000, 358680_289461910),
        (15, 300000_000000000_000000000, 107604086_838573260),
        (70, 90_000000000_000000000, 0),
        (70, 1000_000000000_000000000, 1673841_350822250),
        (70, 300000_000000000_000000000, 502152405_246675214),
        (150, 90_000000000_000000000, 0),
        (150, 1000_000000000_000000000, 2453013_311931494),
        (150, 300000_000000000_000000000, 7359039935_79448585),
        (252, 90_000000000_000000000, 0),
        (252, 1000_000000000_000000000, 3413258_170188724),
        (252, 300000_000000000_000000000, 1_025136870_291777355),
        (365250, 300000_000000000_000000000, 1036_019465637_415095346),
    ],
)
@freeze_time("2023-08-09 01:48:47")
def test_estimate_budget(mocker, graphql_client, patch_epochs, days, amount, expected):
    MOCK_EPOCHS.get_current_epoch.return_value = 1
    deposits = [
        create_deposit_event(
            amount=str(100000000_000000000_000000000), timestamp=1691510401
        ),
    ]
    epochs = [
        create_epoch_event(
            start=1691510400,
            end=1697731200,
            duration=6220800,
            decision_window=1209600,
            epoch=1,
        ),
        create_epoch_event(
            start=1697731200,
            end=1703952000,
            duration=7776000,
            decision_window=1209600,
            epoch=2,
        ),
        create_epoch_event(
            start=1703952000,
            end=1710172800,
            duration=7776000,
            decision_window=1209600,
            epoch=3,
        ),
    ]
    mock_graphql(mocker, deposit_events=deposits, epochs_events=epochs)

    result = estimate_budget(days, amount)

    assert result == expected


def test_estimate_budget_validates_inputs():
    with pytest.raises(exceptions.RewardsException):
        user_controller.estimate_budget(-1, 1000)

    with pytest.raises(exceptions.RewardsException):
        user_controller.estimate_budget(MAX_DAYS_TO_ESTIMATE_BUDGET + 1, 1000)

    with pytest.raises(exceptions.RewardsException):
        user_controller.estimate_budget(100, -1)

    with pytest.raises(exceptions.RewardsException):
        user_controller.estimate_budget(100, GLM_TOTAL_SUPPLY_WEI + 1)


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
