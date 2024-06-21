import pytest

from app.modules.dto import AccountFundsDTO, ProjectAccountFundsDTO
from app.modules.projects.rewards.service.finalizing import FinalizingProjectRewards
from app.modules.snapshots.finalized.service.simulated import (
    SimulatedFinalizedSnapshots,
)
from tests.helpers.constants import MATCHED_REWARDS
from tests.helpers.context import get_context
from tests.helpers import make_user_allocation


@pytest.fixture(autouse=True)
def before(app):
    pass


def test_simulate_finalized_snapshots(
    mock_users_db, mock_octant_rewards, mock_patron_mode, mock_user_rewards
):
    context = get_context(1)
    projects = context.projects_details.projects
    make_user_allocation(context, mock_users_db[2])

    service = SimulatedFinalizedSnapshots(
        patrons_mode=mock_patron_mode,
        octant_rewards=mock_octant_rewards,
        user_rewards=mock_user_rewards,
        project_rewards=FinalizingProjectRewards(),
    )

    result = service.simulate_finalized_epoch_snapshot(context)

    assert result.patrons_rewards == 5598519_420519815
    assert result.matched_rewards == MATCHED_REWARDS
    assert result.user_rewards == [
        AccountFundsDTO(address=mock_users_db[0].address, amount=100_000000000),
        AccountFundsDTO(address=mock_users_db[1].address, amount=200_000000000),
    ]
    assert result.projects_rewards == [
        ProjectAccountFundsDTO(
            address=projects[0],
            amount=MATCHED_REWARDS + 100,
            matched=MATCHED_REWARDS,
        )
    ]
    assert result.total_withdrawals == MATCHED_REWARDS + 100 + 300_000000000
    assert result.leftover == 101_814368507_786751493
    assert (
        result.merkle_root
        == "0xe3cd8746f9df50db5c4cbc1962f3dcb0db4236bb06960593d36444a86e296b3c"
    )
