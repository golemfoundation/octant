import pytest

from app.engine.projects.rewards import ProjectRewardDTO
from app.infrastructure import database
from app.modules.dto import AccountFundsDTO, AllocationDTO
from app.modules.snapshots.finalized.service.simulated import (
    SimulatedFinalizedSnapshots,
)
from tests.helpers.constants import MATCHED_REWARDS
from tests.helpers.context import get_context


@pytest.fixture(autouse=True)
def before(app):
    pass


def test_simulate_finalized_snapshots(
    mock_users_db, mock_octant_rewards, mock_patron_mode, mock_user_rewards
):
    context = get_context(1)
    projects = context.projects_details.projects
    database.allocations.add_all(
        1, mock_users_db[2].id, 0, [AllocationDTO(projects[0], 100)]
    )

    service = SimulatedFinalizedSnapshots(
        patrons_mode=mock_patron_mode,
        octant_rewards=mock_octant_rewards,
        user_rewards=mock_user_rewards,
    )

    result = service.simulate_finalized_epoch_snapshot(context)

    assert result.patrons_rewards == 5598519_420519815
    assert result.matched_rewards == MATCHED_REWARDS
    assert result.user_rewards == [
        AccountFundsDTO(address=mock_users_db[0].address, amount=100_000000000),
        AccountFundsDTO(address=mock_users_db[1].address, amount=200_000000000),
    ]
    assert result.projects_rewards[0] == ProjectRewardDTO(
        address=projects[0],
        allocated=100,
        matched=MATCHED_REWARDS,
    )
    for project in result.projects_rewards[1:]:
        assert project.allocated == 0
        assert project.matched == 0
    assert result.total_withdrawals == MATCHED_REWARDS + 100 + 300_000000000
    assert result.leftover == 101_814368507_786751493
    assert (
        result.merkle_root
        == "0xe101e4e5e6ec94887f0c0257ca06bcf312f14a11319cd7405732412f1135cc40"
    )
