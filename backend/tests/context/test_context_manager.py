import pytest
from app import db
from app.context.epoch_state import EpochState
from app.context.manager import epoch_context, state_context
from app.exceptions import InvalidEpoch
from app.infrastructure import database
from tests.conftest import (
    ETH_PROCEEDS,
    MATCHED_REWARDS,
    MOCK_EPOCHS,
    MOCKED_FINALIZED_EPOCH_NO,
    MOCKED_PENDING_EPOCH_NO,
    TOTAL_ED,
)
from tests.helpers.constants import (
    VANILLA_INDIVIDUAL_REWARDS,
    LOCKED_RATIO,
    TOTAL_REWARDS,
)
from tests.helpers.constants import LEFTOVER, OPERATIONAL_COST


@pytest.fixture(autouse=True)
def before(
    app,
    patch_epochs,
    patch_glm,
    patch_eth_get_balance,
    patch_projects,
    mock_epoch_details,
):
    pass


@pytest.mark.parametrize(
    "current, pending, finalized, epoch_num, pending_snapshot, finalized_snapshot, expected",
    [
        (2, 1, 0, 3, False, False, EpochState.FUTURE),
        (2, 1, 0, 2, False, False, EpochState.CURRENT),
        (2, 1, 0, 1, False, False, EpochState.PRE_PENDING),
        (2, 1, 0, 1, True, False, EpochState.PENDING),
        (2, None, 1, 1, True, False, EpochState.FINALIZING),
        (2, None, 1, 1, True, True, EpochState.FINALIZED),
    ],
)
def test_context_from_epoch(
    current,
    pending,
    finalized,
    epoch_num,
    pending_snapshot,
    finalized_snapshot,
    expected,
    patch_etherscan_get_block_api,
):
    _setup(current, pending, finalized, pending_snapshot, finalized_snapshot)

    context = epoch_context(epoch_num)

    assert context.epoch_state == expected
    assert context.epoch_details.epoch_num == epoch_num
    assert context.epoch_settings is not None
    assert context.epoch_details is not None
    assert context.projects_details is not None
    assert len(context.projects_details.projects) == 10


@pytest.mark.parametrize(
    "current, pending, finalized, state, pending_snapshot, finalized_snapshot, expected",
    [
        (2, 1, 0, EpochState.FUTURE, False, False, 3),
        (2, 1, 0, EpochState.CURRENT, False, False, 2),
        (2, 1, 0, EpochState.PRE_PENDING, False, False, 1),
        (2, 1, 0, EpochState.PENDING, True, False, 1),
        (2, None, 1, EpochState.FINALIZING, True, False, 1),
        (2, None, 1, EpochState.FINALIZED, True, True, 1),
    ],
)
def test_context_from_state(
    current,
    pending,
    finalized,
    state,
    pending_snapshot,
    finalized_snapshot,
    expected,
    patch_etherscan_get_block_api,
):
    _setup(current, pending, finalized, pending_snapshot, finalized_snapshot)

    context = state_context(state)

    assert context.epoch_details.epoch_num == expected
    assert context.epoch_state == state
    assert context.epoch_settings is not None
    assert context.epoch_details is not None
    assert context.projects_details is not None
    assert len(context.projects_details.projects) == 10


@pytest.mark.parametrize(
    "current, pending, finalized, state, pending_snapshot, finalized_snapshot",
    [
        (2, None, 0, EpochState.PRE_PENDING, False, False),
        (2, 1, 0, EpochState.PRE_PENDING, True, False),
        (2, 1, 0, EpochState.PENDING, False, False),
        (2, 1, 0, EpochState.FINALIZING, False, False),
        (2, None, 1, EpochState.FINALIZING, False, False),
        (2, None, 1, EpochState.FINALIZING, True, True),
        (2, None, 1, EpochState.FINALIZED, False, False),
        (2, None, 1, EpochState.FINALIZED, True, False),
    ],
)
def test_cannot_get_context_in_invalid_state(
    current, pending, finalized, state, pending_snapshot, finalized_snapshot
):
    _setup(current, pending, finalized, pending_snapshot, finalized_snapshot)

    with pytest.raises(InvalidEpoch):
        state_context(state)


def test_epoch_state_gt():
    assert (
        EpochState.FUTURE
        > EpochState.CURRENT
        > EpochState.PRE_PENDING
        > EpochState.PENDING
        > EpochState.FINALIZING
        > EpochState.FINALIZED
    )


def test_epoch_state_lt():
    assert (
        EpochState.FINALIZED
        < EpochState.FINALIZING
        < EpochState.PENDING
        < EpochState.PRE_PENDING
        < EpochState.CURRENT
        < EpochState.FUTURE
    )


def _setup(current, pending, finalized, pending_snapshot, finalized_snapshot):
    MOCK_EPOCHS.get_current_epoch.return_value = current
    MOCK_EPOCHS.get_pending_epoch.return_value = pending
    MOCK_EPOCHS.get_finalized_epoch.return_value = finalized
    if pending_snapshot:
        database.pending_epoch_snapshot.save_snapshot(
            MOCKED_PENDING_EPOCH_NO,
            ETH_PROCEEDS,
            TOTAL_ED,
            LOCKED_RATIO,
            TOTAL_REWARDS,
            VANILLA_INDIVIDUAL_REWARDS,
            OPERATIONAL_COST,
        )
    if finalized_snapshot:
        database.finalized_epoch_snapshot.save_snapshot(
            MOCKED_FINALIZED_EPOCH_NO, MATCHED_REWARDS, 0, LEFTOVER
        )
    db.session.commit()
