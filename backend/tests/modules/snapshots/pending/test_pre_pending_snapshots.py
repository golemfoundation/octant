import pytest
from sqlalchemy.exc import IntegrityError

from app.infrastructure import database
from app.modules.snapshots.pending.service.pre_pending import (
    PrePendingSnapshots,
)
from tests.conftest import ETH_PROCEEDS, USER1_ADDRESS, USER2_ADDRESS
from tests.helpers.constants import COMMUNITY_FUND, PPF
from tests.helpers.context import get_context


@pytest.fixture(autouse=True)
def before(app):
    pass


def test_save_pending_epoch_snapshot(mock_user_deposits, mock_octant_rewards):
    context = get_context()
    service = PrePendingSnapshots(
        effective_deposits=mock_user_deposits, octant_rewards=mock_octant_rewards
    )

    result = service.create_pending_epoch_snapshot(context)

    assert result == 1
    snapshot = database.pending_epoch_snapshot.get_last_snapshot()
    assert snapshot.epoch == 1
    assert snapshot.created_at is not None
    assert snapshot.eth_proceeds == str(ETH_PROCEEDS)
    assert snapshot.total_effective_deposit == "100022700000000000099999994"
    assert snapshot.locked_ratio == "0.100022700000000000099999994"
    assert snapshot.vanilla_individual_rewards == "101814368807786782825"
    assert snapshot.total_rewards == "321928767123288031232"
    assert snapshot.operational_cost == "80482191780822000000"
    assert snapshot.ppf == str(PPF)
    assert snapshot.community_fund == str(COMMUNITY_FUND)

    deposits = database.deposits.get_all_by_epoch(1)
    assert len(deposits) == 2
    assert deposits[USER1_ADDRESS].user.address == USER1_ADDRESS
    assert deposits[USER1_ADDRESS].effective_deposit == "270000000000000000000"
    assert deposits[USER1_ADDRESS].epoch_end_deposit == "300000000000000000000"
    assert deposits[USER2_ADDRESS].user.address == USER2_ADDRESS
    assert deposits[USER2_ADDRESS].effective_deposit == "2790000000000000000000"
    assert deposits[USER2_ADDRESS].epoch_end_deposit == "3100000000000000000000"

    budgets = database.budgets.get_all_by_epoch(1)
    assert len(budgets) == 2
    assert budgets[USER1_ADDRESS] == 274836407916427
    assert budgets[USER2_ADDRESS] == 2839976215136415


def test_cannot_save_pending_epoch_snapshot_twice(
    mock_user_deposits, mock_octant_rewards
):
    context = get_context()
    service = PrePendingSnapshots(
        effective_deposits=mock_user_deposits, octant_rewards=mock_octant_rewards
    )

    service.create_pending_epoch_snapshot(context)
    with pytest.raises(IntegrityError):
        service.create_pending_epoch_snapshot(context)
