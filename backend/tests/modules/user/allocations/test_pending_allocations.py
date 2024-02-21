from unittest.mock import Mock

import pytest

from app.engine.projects.rewards import ProjectRewardDTO
from app.extensions import db
from app.infrastructure import database
from app.modules.dto import AllocationDTO
from app.modules.user.allocations.service.pending import PendingUserAllocations
from tests.helpers.constants import MATCHED_REWARDS
from tests.helpers.context import get_context


@pytest.fixture(autouse=True)
def before(app):
    pass


def test_get_all_donors_addresses(mock_users_db, proposal_accounts):
    user1, user2, user3 = mock_users_db

    allocation = [
        AllocationDTO(proposal_accounts[0].address, 100),
    ]

    database.allocations.add_all(1, user1.id, 0, allocation)
    database.allocations.add_all(1, user2.id, 0, allocation)
    database.allocations.add_all(2, user3.id, 0, allocation)
    db.session.commit()

    context_epoch_1 = get_context(1)
    context_epoch_2 = get_context(2)

    service = PendingUserAllocations(octant_rewards=Mock())

    result_epoch_1 = service.get_all_donors_addresses(context_epoch_1)
    result_epoch_2 = service.get_all_donors_addresses(context_epoch_2)

    assert result_epoch_1 == [user1.address, user2.address]
    assert result_epoch_2 == [user3.address]


def test_return_only_not_removed_allocations(mock_users_db, proposal_accounts):
    user1, user2, _ = mock_users_db

    allocation = [
        AllocationDTO(proposal_accounts[0].address, 100),
    ]

    database.allocations.add_all(1, user1.id, 0, allocation)
    database.allocations.add_all(1, user2.id, 0, allocation)
    database.allocations.soft_delete_all_by_epoch_and_user_id(1, user2.id)
    db.session.commit()

    context = get_context(1)

    service = PendingUserAllocations(octant_rewards=Mock())

    result = service.get_all_donors_addresses(context)

    assert result == [user1.address]


def test_simulate_allocation(mock_users_db, mock_octant_rewards):
    user1, _, _ = mock_users_db
    context = get_context()
    projects = context.projects_details.projects
    prev_allocation = [
        AllocationDTO(projects[0], 100_000000000),
    ]
    database.allocations.add_all(1, user1.id, 0, prev_allocation)

    next_allocations = [
        AllocationDTO(projects[1], 200_000000000),
    ]

    service = PendingUserAllocations(octant_rewards=mock_octant_rewards)

    leverage, rewards = service.simulate_allocation(
        context, next_allocations, user1.address
    )

    sorted_projects = sorted(projects)
    assert leverage == 1100571991.5775063
    assert rewards == [
        ProjectRewardDTO(sorted_projects[0], 0, 0),
        ProjectRewardDTO(sorted_projects[1], 0, 0),
        ProjectRewardDTO(sorted_projects[2], 200_000000000, MATCHED_REWARDS),
        ProjectRewardDTO(sorted_projects[3], 0, 0),
        ProjectRewardDTO(sorted_projects[4], 0, 0),
        ProjectRewardDTO(sorted_projects[5], 0, 0),
        ProjectRewardDTO(sorted_projects[6], 0, 0),
        ProjectRewardDTO(sorted_projects[7], 0, 0),
        ProjectRewardDTO(sorted_projects[8], 0, 0),
        ProjectRewardDTO(sorted_projects[9], 0, 0),
    ]
