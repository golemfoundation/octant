import pytest

from tests.helpers.constants import (
    MOCKED_EPOCH_NO_WITH_CAPPED_MR,
    COMMUNITY_FUND,
    PPF,
    MOCKED_FINALIZED_EPOCH_NO,
    MATCHED_REWARDS_AFTER_OVERHAUL,
    MATCHED_REWARDS,
    LEFTOVER,
    LEFTOVER_WITH_PPF_UNUSED_MR,
)
from tests.helpers.finalized_snapshots import create_finalized_snapshot
from tests.helpers.pending_snapshot import create_pending_snapshot


@pytest.fixture(scope="function")
def mock_pending_epoch_snapshot_with_uq_scores(
    mock_users_db_with_scores, ppf=PPF, cf=COMMUNITY_FUND
):
    user1_, user2, user3 = mock_users_db_with_scores
    create_pending_snapshot(
        epoch_nr=MOCKED_EPOCH_NO_WITH_CAPPED_MR,
        optional_ppf=ppf,
        optional_cf=cf,
        mock_users_db=mock_users_db_with_scores,
    )
    return user1_, user2, user3


@pytest.fixture(scope="function")
def mock_finalized_epoch_snapshot_db(app, user_accounts):
    create_finalized_snapshot(MOCKED_FINALIZED_EPOCH_NO, MATCHED_REWARDS, LEFTOVER)


@pytest.fixture(scope="function")
def mock_finalized_epoch_snapshot_db_for_e4(app, user_accounts):
    create_finalized_snapshot(
        MOCKED_EPOCH_NO_WITH_CAPPED_MR,
        MATCHED_REWARDS_AFTER_OVERHAUL,
        LEFTOVER_WITH_PPF_UNUSED_MR,
    )
