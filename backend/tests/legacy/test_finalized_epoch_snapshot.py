import pytest
from freezegun import freeze_time

from app import exceptions
from app.extensions import db
from app.infrastructure import database
from app.legacy.controllers.snapshots import (
    finalized_snapshot_status,
    snapshot_finalized_epoch,
)
from app.legacy.core.user.patron_mode import toggle_patron_mode
from app.legacy.core.user.rewards import get_all_claimed_rewards
from tests.conftest import (
    mock_graphql,
    allocate_user_rewards,
    TOTAL_REWARDS,
    ALL_INDIVIDUAL_REWARDS,
)
from tests.helpers import create_epoch_event
from tests.helpers.constants import USER3_BUDGET

MOCKED_FINALIZED_EPOCH_NO = 1


@pytest.fixture(autouse=True)
def before(
    mocker,
    graphql_client,
    patch_epochs,
    patch_proposals,
    patch_has_pending_epoch_snapshot,
):
    epoch = create_epoch_event(
        start=1698802327, end=1698803327, duration=1000, epoch=MOCKED_FINALIZED_EPOCH_NO
    )

    mock_graphql(mocker, epochs_events=[epoch])


@freeze_time("2023-11-01 01:48:47")
def test_finalized_epoch_snapshot_with_rewards(
    user_accounts, proposal_accounts, mock_pending_epoch_snapshot_db
):
    user1_allocation = 1000_000000000
    user2_allocation = 2000_000000000
    allocate_user_rewards(user_accounts[0], proposal_accounts[0], user1_allocation)
    allocate_user_rewards(user_accounts[1], proposal_accounts[1], user2_allocation)

    result = snapshot_finalized_epoch()
    assert result == 1

    rewards = database.rewards.get_by_epoch(result)
    assert len(rewards) == 4
    assert rewards[0].address == user_accounts[1].address
    assert rewards[0].amount == str(5596519_420519815)
    assert rewards[0].matched is None
    assert rewards[1].address == proposal_accounts[1].address
    assert rewards[1].amount == str(146_742934210_334165604)
    assert rewards[1].matched == str(146_742932210_334165604)
    assert rewards[2].address == proposal_accounts[0].address
    assert rewards[2].amount == str(73_371467105_167082802)
    assert rewards[2].matched == str(73_371466105_167082802)
    assert rewards[3].address == user_accounts[0].address
    assert rewards[3].amount == str(1525868_989237987)
    assert rewards[3].matched is None

    snapshot = database.finalized_epoch_snapshot.get_by_epoch_num(result)
    _, claimed_rewards_sum = get_all_claimed_rewards(result)
    rewards_back_to_gf = (
        ALL_INDIVIDUAL_REWARDS
        - claimed_rewards_sum
        - user1_allocation
        - user2_allocation
    )
    assert snapshot.matched_rewards == "220114398315501248407"
    assert int(snapshot.total_withdrawals) == pytest.approx(
        TOTAL_REWARDS - rewards_back_to_gf, 0.000000000000000001
    )
    assert snapshot.leftover == "101807243419376993792"
    assert snapshot.patrons_rewards == "0"
    assert (
        snapshot.withdrawals_merkle_root
        == "0x81c1e5cfcd6a938330bb2d36d7301e7425158c6851566d3c96de6346d8a6cd2f"
    )
    assert snapshot.created_at is not None


@freeze_time("2023-11-01 01:48:47")
def test_finalized_epoch_snapshot_with_patrons_enabled(
    user_accounts, proposal_accounts, mock_pending_epoch_snapshot_db
):
    user1_allocation = 1000_000000000
    user2_allocation = 2000_000000000

    toggle_patron_mode(user_accounts[2].address)
    db.session.commit()

    allocate_user_rewards(user_accounts[0], proposal_accounts[0], user1_allocation)
    allocate_user_rewards(user_accounts[1], proposal_accounts[1], user2_allocation)

    result = snapshot_finalized_epoch()
    assert result == 1

    rewards = database.rewards.get_by_epoch(result)
    assert len(rewards) == 4
    assert rewards[0].address == user_accounts[1].address
    assert rewards[0].amount == str(5596519_420519815)
    assert rewards[0].matched is None
    assert rewards[1].address == proposal_accounts[1].address
    assert rewards[1].amount == str(146_744291427_163382529)
    assert rewards[1].matched == str(146_744289427_163382529)
    assert rewards[2].address == proposal_accounts[0].address
    assert rewards[2].amount == str(73_372145713_581691264)
    assert rewards[2].matched == str(73_372144713_581691264)
    assert rewards[3].address == user_accounts[0].address
    assert rewards[3].amount == str(1525868_989237987)
    assert rewards[3].matched is None

    snapshot = database.finalized_epoch_snapshot.get_by_epoch_num(result)
    _, claimed_rewards_sum = get_all_claimed_rewards(result)
    rewards_back_to_gf = (
        ALL_INDIVIDUAL_REWARDS
        - claimed_rewards_sum
        - user1_allocation
        - user2_allocation
        - USER3_BUDGET
    )
    assert snapshot.matched_rewards == "220116434140745073794"
    assert int(snapshot.total_withdrawals) == pytest.approx(
        TOTAL_REWARDS - rewards_back_to_gf, 0.000000000000000001
    )
    assert snapshot.leftover == "101805207594133168405"
    assert snapshot.patrons_rewards == "2035825243825387"
    assert (
        snapshot.withdrawals_merkle_root
        == "0x7d73cf5edadc99cb7843ce9b076468e97ee9038f5f351d23fc7e0c48aa528303"
    )
    assert snapshot.created_at is not None


@freeze_time("2023-11-01 01:48:47")
def test_finalized_epoch_snapshot_without_rewards(
    user_accounts, proposal_accounts, mock_pending_epoch_snapshot_db
):
    result = snapshot_finalized_epoch()
    assert result == 1

    rewards = database.rewards.get_by_epoch(result)
    assert len(rewards) == 0

    snapshot = database.finalized_epoch_snapshot.get_by_epoch_num(result)
    assert snapshot.matched_rewards == "220114398315501248407"
    assert snapshot.total_withdrawals == "0"
    assert snapshot.withdrawals_merkle_root is None
    assert snapshot.created_at is not None


@pytest.mark.parametrize(
    "epoch, snapshot, is_open, expected",
    [
        (1, 1, False, "not_applicable"),
        (1, 1, True, "not_applicable"),
        (2, 1, False, "done"),
        (2, 1, True, "error"),  # snapshot performed before voting ended, illegal
        (2, 0, True, "too_early"),
        (5, 3, True, "too_early"),
        (2, 0, False, "in_progress"),
        (5, 3, False, "in_progress"),
        (3, 0, True, "error"),  # snapshot not performed on time
        (3, 0, False, "error"),  # snapshot not performed on time
    ],
)
def test_finalized_snapshot_status(epoch, snapshot, is_open, expected):
    try:
        output = finalized_snapshot_status(epoch, snapshot, is_open)
    except exceptions.OctantException:
        output = "error"
    assert output == expected
