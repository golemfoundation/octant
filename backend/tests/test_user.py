from datetime import timedelta, datetime, timezone

import pytest
from eth_account import Account
from freezegun import freeze_time

from app import exceptions, database
from app.controllers.snapshots import get_pending_snapshot
from app.extensions import db
from app.constants import GLM_TOTAL_SUPPLY_WEI
from app.controllers.user import (
    MAX_DAYS_TO_ESTIMATE_BUDGET,
    get_patron_mode_status,
    toggle_patron_mode,
)
from app.core.user.budget import get_budget, estimate_budget, get_patrons_budget
from app.core.user.rewards import get_all_claimed_rewards
from app.core.allocations import add_allocations_to_db, Allocation
from app.core.user.patron_mode import toggle_patron_mode as toggle_patron_mode_direct

from app.controllers import allocations as allocations_controller
from app.controllers import user as user_controller


from tests.helpers import generate_epoch_events, create_epoch_event
from tests.conftest import (
    allocate_user_rewards,
    MOCKED_PENDING_EPOCH_NO,
    mock_graphql,
    MOCK_EPOCHS,
)
from tests.helpers.constants import USER1_BUDGET, USER2_BUDGET


@pytest.fixture(autouse=True)
def before(app, patch_epochs, patch_proposals, patch_is_contract):
    pass


@pytest.fixture()
def make_allocations(app, proposal_accounts):
    def make_allocations(user, epoch):
        nonce = allocations_controller.get_allocation_nonce(user.address)

        allocations = [
            Allocation(proposal_accounts[0].address, 10 * 10**18),
            Allocation(proposal_accounts[1].address, 20 * 10**18),
            Allocation(proposal_accounts[2].address, 30 * 10**18),
        ]
        add_allocations_to_db(epoch, user.address, nonce, allocations, True)

        db.session.commit()

    return make_allocations


def test_get_user_budget(user_accounts, mock_pending_epoch_snapshot_db):
    expected_result = USER1_BUDGET
    result = get_budget(user_accounts[0].address, MOCKED_PENDING_EPOCH_NO)

    assert result == expected_result


@pytest.mark.parametrize(
    "days,amount,expected",
    [
        (0, 0, 0),
        (15, 90, 0),
        (15, 1000_000000000_000000000, 141780_821917808),
        (15, 300000_000000000_000000000, 42534246_575342465),
        (70, 90_000000000_000000000, 0),
        (70, 1000_000000000_000000000, 661643_835616438),
        (70, 300000_000000000_000000000, 19849315_0684931507),
        (150, 90_000000000_000000000, 0),
        (150, 1000_000000000_000000000, 1417808_219178081),
        (150, 300000_000000000_000000000, 425342465_753424658),
        (252, 90_000000000_000000000, 0),
        (252, 1000_000000000_000000000, 2381917_808219177),
        (252, 300000_000000000_000000000, 714575342_465753426),
        (365250, 300000_000000000_000000000, 1035_708904109_589043041),
    ],
)
@freeze_time("2023-08-09 01:48:47")
def test_estimate_budget(
    mocker, graphql_client, patch_epochs, patch_glm, days, amount, expected
):
    MOCK_EPOCHS.get_current_epoch.return_value = 2
    epochs = [
        create_epoch_event(
            start=1691510400,
            end=1697731200,
            duration=6220800,
            decision_window=1209600,
            epoch=1,
        )
    ] + generate_epoch_events(
        first_epoch=2,
        start=1697731200,
        duration=7776000,
        decision_window=1209600,
        epoches=2,
    )

    mock_graphql(mocker, epochs_events=epochs)

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
                0: 1026868_989237987,
                1: 4998519_420519815,
            },
        ),
        # ------------------------------------
        (
            {
                0: [(1, 1526868_989237987)],
                1: [(2, 0)],
            },
            {
                1: 5598519_420519815,
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

            nonce = allocations_controller.get_allocation_nonce(user_account.address)
            allocate_user_rewards(
                user_account, proposal_account, allocation_amount, nonce
            )

    expected = {}

    for user_index, expected_reward in expected_rewards.items():
        user_address = user_accounts[user_index].address
        expected[user_address] = expected_reward

    user_rewards, rewards_sum = get_all_claimed_rewards(MOCKED_PENDING_EPOCH_NO)
    assert len(user_rewards) == len(expected)
    for user in user_rewards:
        assert expected.get(user.address) == user.amount

    assert rewards_sum == sum(expected_rewards.values())


def test_get_patron_mode_status_return_false_when_user_does_not_exist(user_accounts):
    result = get_patron_mode_status(user_accounts[0].address)
    assert result is False


def test_patron_mode_status_toggle_raises_error_when_user_does_not_exist(user_accounts):
    with pytest.raises(exceptions.UserNotFound):
        toggle_patron_mode(user_accounts[0].address, "abcd")


def test_patron_mode_status_toggle_raises_error_when_signature_is_invalid(
    user_accounts,
):
    invalid_sig = "ab181bbf991fca4134510f6d79df07f2e5f6ea5a2b3326b955dbc6b3e4c4dfd1444cd94aaa4c08e80843b2e8f9caef09298f38b3a5b3358de58ffa9a3b4313c91b"
    database.user.add_user(user_accounts[0].address)
    with pytest.raises(exceptions.InvalidSignature):
        toggle_patron_mode(user_accounts[0].address, invalid_sig)


def test_patron_mode_status_toggle(user_accounts):
    database.user.add_user(user_accounts[0].address)
    status = get_patron_mode_status(user_accounts[0].address)
    assert status is False

    toggle_true_sig = "52d249ca8ac8f40c01613635dac8a9b01eb50230ad1467451a058170726650b92223e80032a4bff4d25c3554e9d1347043c53b4c2dc9f1ba3f071bd3a1c8b9121b"
    toggle_patron_mode(user_accounts[0].address, toggle_true_sig)
    status = get_patron_mode_status(user_accounts[0].address)
    assert status is True

    toggle_false_sig = "979b997cb2b990f104ed4d342a364207a019649eda00497780033d154ee07c44141a6be33cecdde879b1b4238c1622660e70baddb745def53d6733e4aacaeb181b"
    toggle_patron_mode(user_accounts[0].address, toggle_false_sig)
    status = get_patron_mode_status(user_accounts[0].address)
    assert status is False


def test_patron_mode_toggle_fails_when_use_sig_to_enable_for_disable(user_accounts):
    database.user.add_user(user_accounts[0].address)
    toggle_false_sig = "979b997cb2b990f104ed4d342a364207a019649eda00497780033d154ee07c44141a6be33cecdde879b1b4238c1622660e70baddb745def53d6733e4aacaeb181b"
    with pytest.raises(exceptions.InvalidSignature):
        toggle_patron_mode(user_accounts[0].address, toggle_false_sig)


def test_patron_mode_toggle_fails_when_use_sig_to_disable_for_enable(user_accounts):
    database.user.add_user(user_accounts[0].address)
    toggle_true_sig = "52d249ca8ac8f40c01613635dac8a9b01eb50230ad1467451a058170726650b92223e80032a4bff4d25c3554e9d1347043c53b4c2dc9f1ba3f071bd3a1c8b9121b"
    toggle_patron_mode(user_accounts[0].address, toggle_true_sig)

    with pytest.raises(exceptions.InvalidSignature):
        toggle_patron_mode(user_accounts[0].address, toggle_true_sig)


def test_patron_mode_revokes_allocations_for_the_epoch(alice, make_allocations):
    toggle_true_sig = "52d249ca8ac8f40c01613635dac8a9b01eb50230ad1467451a058170726650b92223e80032a4bff4d25c3554e9d1347043c53b4c2dc9f1ba3f071bd3a1c8b9121b"
    make_allocations(alice, MOCKED_PENDING_EPOCH_NO)
    assert len(allocations_controller.get_all_by_user_and_epoch(alice.address)) == 3

    toggle_patron_mode(alice.address, toggle_true_sig)

    user_active_allocations = allocations_controller.get_all_by_user_and_epoch(
        alice.address
    )
    assert len(user_active_allocations) == 0


def test_when_patron_mode_changes_revoked_allocations_are_not_restored(
    alice, make_allocations
):
    toggle_true_sig = "52d249ca8ac8f40c01613635dac8a9b01eb50230ad1467451a058170726650b92223e80032a4bff4d25c3554e9d1347043c53b4c2dc9f1ba3f071bd3a1c8b9121b"
    toggle_false_sig = "979b997cb2b990f104ed4d342a364207a019649eda00497780033d154ee07c44141a6be33cecdde879b1b4238c1622660e70baddb745def53d6733e4aacaeb181b"
    make_allocations(alice, MOCKED_PENDING_EPOCH_NO)

    toggle_patron_mode(alice.address, toggle_true_sig)
    toggle_patron_mode(alice.address, toggle_false_sig)

    user_active_allocations = allocations_controller.get_all_by_user_and_epoch(
        alice.address
    )
    assert len(user_active_allocations) == 0


def test_patron_mode_does_not_revoke_allocations_from_previous_epochs(
    alice, make_allocations
):
    toggle_true_sig = "52d249ca8ac8f40c01613635dac8a9b01eb50230ad1467451a058170726650b92223e80032a4bff4d25c3554e9d1347043c53b4c2dc9f1ba3f071bd3a1c8b9121b"
    make_allocations(alice, MOCKED_PENDING_EPOCH_NO - 1)
    make_allocations(alice, MOCKED_PENDING_EPOCH_NO)

    user_active_allocations_pre = allocations_controller.get_all_by_user_and_epoch(
        alice.address
    )
    user_prev_epoch_allocations_pre = allocations_controller.get_all_by_user_and_epoch(
        alice.address, MOCKED_PENDING_EPOCH_NO - 1
    )

    assert len(user_active_allocations_pre) == 3
    assert len(user_prev_epoch_allocations_pre) == 3

    toggle_patron_mode(alice.address, toggle_true_sig)

    user_active_allocations_post = allocations_controller.get_all_by_user_and_epoch(
        alice.address
    )
    user_prev_epoch_allocations_post = allocations_controller.get_all_by_user_and_epoch(
        alice.address, MOCKED_PENDING_EPOCH_NO - 1
    )

    assert user_active_allocations_post != user_active_allocations_pre
    assert user_prev_epoch_allocations_post == user_prev_epoch_allocations_pre


def test_patron_mode_can_be_toggled_outside_allocation_period(user_accounts):
    MOCK_EPOCHS.get_pending_epoch.return_value = None

    database.user.add_user(user_accounts[0].address)
    toggle_true_sig = "52d249ca8ac8f40c01613635dac8a9b01eb50230ad1467451a058170726650b92223e80032a4bff4d25c3554e9d1347043c53b4c2dc9f1ba3f071bd3a1c8b9121b"
    toggle_patron_mode(user_accounts[0].address, toggle_true_sig)

    status = get_patron_mode_status(user_accounts[0].address)

    assert status is True


def test_patrons_budget(alice, bob, mock_pending_epoch_snapshot_db, mock_epoch_details):
    alice_budget = USER1_BUDGET
    bob_budget = USER2_BUDGET
    pending_snapshot = get_pending_snapshot(MOCKED_PENDING_EPOCH_NO)

    # Mocked Epoch 1 duration is between 1000s-2000s, with decision window of 500s.

    with freeze_time(datetime.fromtimestamp(0, tz=timezone.utc)) as frozen_time:
        # No patrons have been declared
        assert get_patrons_budget(pending_snapshot) == 0

        # Alice becomes a patron during Epoch 0
        toggle_patron_mode_direct(alice.address)

        # Move to Epoch 1 start
        frozen_time.tick(delta=timedelta(seconds=1000))

        # Alice declared herself as a patron at 0 tick, thus before Epoch 1 has started, still, she
        # is considered a patron in Epoch 1
        assert get_patrons_budget(pending_snapshot) == alice_budget

        # Move to Epoch 2 but within Epoch 1 AW
        frozen_time.tick(delta=timedelta(seconds=(1000 + 100)))

        assert get_patrons_budget(pending_snapshot) == alice_budget

        # Bob becomes patron during Epoch 1 AW
        toggle_patron_mode_direct(bob.address)

        assert get_patrons_budget(pending_snapshot) == alice_budget + bob_budget

        # Alice stops being a patron during Epoch 1 AW
        toggle_patron_mode_direct(alice.address)

        assert get_patrons_budget(pending_snapshot) == bob_budget

        # Move outside of Epoch 1 AW (we're now in Epoch 2 only)
        frozen_time.tick(delta=timedelta(seconds=500))

        # Alice becomes patron again, but in Epoch 2
        toggle_patron_mode_direct(alice.address)

        # Only Bob is a patron at the end of Epoch 1 AW as Alice became a patron again \
        # during Epoch 2, but past Epoch 1 AW
        assert get_patrons_budget(pending_snapshot) == bob_budget
