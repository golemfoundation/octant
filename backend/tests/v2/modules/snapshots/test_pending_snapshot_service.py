from unittest.mock import Mock

import pytest

from app.context.context import ContextBuilder
from app.v2.engine.user.effective_deposit import UserDeposit
from app.v2.modules import snapshots as snapshots_module
from app.v2.modules import user as user_module
from app.v2.modules.octant_rewards.service.octant_rewards import OctantRewardsDTO
from app.v2.modules.snapshots.service.pending_snapshot import PendingSnapshotsService
from tests.conftest import (
    MOCK_EPOCHS,
    ETH_PROCEEDS,
    TOTAL_REWARDS,
    ALL_INDIVIDUAL_REWARDS,
    LOCKED_RATIO,
)


@pytest.fixture(autouse=True)
def before(app, patch_epochs, mock_epoch_details):
    pass


@pytest.fixture(scope="function")
def user_deposits_service_mock(alice, bob):
    user_deposits_service_mock = Mock()
    user_deposits_service_mock.get_effective_deposits.return_value = (
        [
            UserDeposit(
                alice.address, 270_000000000_000000000, 300_000000000_000000000
            ),
            UserDeposit(
                bob.address, 2790_000000000_000000000, 3100_000000000_000000000
            ),
        ],
        3060_000000000_000000000,
    )
    return user_deposits_service_mock


@pytest.fixture(scope="function")
def octant_rewards_service_mock(alice, bob):
    octant_rewards_service_mock = Mock()
    octant_rewards_service_mock.get_rewards.return_value = OctantRewardsDTO(
        eth_proceeds=ETH_PROCEEDS,
        locked_ratio=LOCKED_RATIO,
        total_rewards=TOTAL_REWARDS,
        all_individual_rewards=ALL_INDIVIDUAL_REWARDS,
    )

    return octant_rewards_service_mock


@pytest.mark.parametrize(
    "epoch",
    [
        1,
        2,
        3,
    ],
)
def test_save_pending_epoch_snapshot(
    epoch, user_deposits_service_mock, octant_rewards_service_mock, alice, bob
):
    MOCK_EPOCHS.get_pending_epoch.return_value = epoch
    context = ContextBuilder().with_pending_epoch_context().build()
    service = PendingSnapshotsService(
        user_deposits_service_mock, octant_rewards_service_mock
    )

    result = service.snapshot_pending_epoch(epoch, context.pending_epoch_context)

    assert result == epoch
    snapshot = snapshots_module.database.pending_snapshot.get_last_snapshot()
    assert snapshot.epoch == epoch
    assert snapshot.created_at is not None
    assert snapshot.eth_proceeds == str(ETH_PROCEEDS)
    assert snapshot.total_effective_deposit == "3060000000000000000000"
    assert snapshot.locked_ratio == "0.100022700000000000099999994"
    assert snapshot.all_individual_rewards == "101814368807786782825"
    assert snapshot.total_rewards == "321928767123288031232"

    deposits = user_module.database.deposits.get_all_by_epoch(epoch)
    assert len(deposits) == 2
    assert deposits[alice.address].user.address == alice.address
    assert deposits[alice.address].effective_deposit == "270000000000000000000"
    assert deposits[alice.address].epoch_end_deposit == "300000000000000000000"
    assert deposits[bob.address].user.address == bob.address
    assert deposits[bob.address].effective_deposit == "2790000000000000000000"
    assert deposits[bob.address].epoch_end_deposit == "3100000000000000000000"


def test_return_none_when_snapshot_is_already_taken(
    user_deposits_service_mock,
    octant_rewards_service_mock,
    mock_pending_epoch_snapshot_db,
):
    MOCK_EPOCHS.get_pending_epoch.return_value = 1
    context = ContextBuilder().with_pending_epoch_context().build()
    service = PendingSnapshotsService(
        user_deposits_service_mock, octant_rewards_service_mock
    )

    result = service.snapshot_pending_epoch(1, context.pending_epoch_context)

    assert result is None
