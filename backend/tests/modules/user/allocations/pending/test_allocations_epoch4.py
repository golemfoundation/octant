"""
Tests are based on the capped QF & user scores.
"""

import pytest

from app.engine.projects.rewards import ProjectRewardDTO
from app.modules.dto import AllocationDTO
from app.modules.user.allocations.service.pending import (
    PendingUserAllocations,
    PendingUserAllocationsVerifier,
)
from tests.helpers.allocations import make_user_allocation
from tests.helpers.constants import MATCHED_REWARDS, LOW_UQ_SCORE
from tests.helpers.context import get_context


@pytest.fixture(autouse=True)
def before(app):
    pass


@pytest.fixture()
def service(
    mock_octant_rewards,
    mock_patron_mode,
    mock_user_budgets,
    mock_user_allocation_nonce,
    mock_uniqueness_quotients,
):
    verifier = PendingUserAllocationsVerifier(
        user_nonce=mock_user_allocation_nonce,
        user_budgets=mock_user_budgets,
        patrons_mode=mock_patron_mode,
    )
    return PendingUserAllocations(
        octant_rewards=mock_octant_rewards,
        verifier=verifier,
        uniqueness_quotients=mock_uniqueness_quotients,
    )


def test_simulate_allocation_with_user_uq_score(service, mock_users_db):
    context = get_context(epoch_num=4)
    projects = context.projects_details.projects

    (
        user1,
        _,
        _,
    ) = mock_users_db  # mock users with no scores since it'll be calculated in the service
    make_user_allocation(context, user1)

    next_allocations = [
        AllocationDTO(projects[1], 200_000000000),
    ]

    leverage, threshold, rewards = service.simulate_allocation(
        context, next_allocations, user1.address
    )
    sorted_projects = sorted(projects)
    assert leverage == 5502859957.887531
    assert threshold is None
    assert rewards == [
        ProjectRewardDTO(sorted_projects[0], 0, 0),
        ProjectRewardDTO(sorted_projects[1], 0, 0),
        ProjectRewardDTO(
            sorted_projects[2], 40000000000, int(MATCHED_REWARDS * LOW_UQ_SCORE)
        ),
        ProjectRewardDTO(sorted_projects[3], 0, 0),
        ProjectRewardDTO(sorted_projects[4], 0, 0),
        ProjectRewardDTO(sorted_projects[5], 0, 0),
        ProjectRewardDTO(sorted_projects[6], 0, 0),
        ProjectRewardDTO(sorted_projects[7], 0, 0),
        ProjectRewardDTO(sorted_projects[8], 0, 0),
        ProjectRewardDTO(sorted_projects[9], 0, 0),
    ]

    assert service.get_user_allocation_sum(context, user1.address) == 100


def test_simulate_allocation_user_uq_score_with_passed_param(service, mock_users_db):
    context = get_context(epoch_num=4)
    projects = context.projects_details.projects

    (
        user1,
        _,
        _,
    ) = mock_users_db  # mock users with no scores since it'll be calculated in the service
    make_user_allocation(context, user1)

    next_allocations = [
        AllocationDTO(projects[1], 200_000000000),
    ]

    leverage, threshold, rewards = service.simulate_allocation(
        context, next_allocations, user1.address, LOW_UQ_SCORE
    )
    sorted_projects = sorted(projects)
    assert leverage == 5502859957.887531
    assert threshold is None
    assert rewards == [
        ProjectRewardDTO(sorted_projects[0], 0, 0),
        ProjectRewardDTO(sorted_projects[1], 0, 0),
        ProjectRewardDTO(
            sorted_projects[2], 40000000000, int(MATCHED_REWARDS * LOW_UQ_SCORE)
        ),
        ProjectRewardDTO(sorted_projects[3], 0, 0),
        ProjectRewardDTO(sorted_projects[4], 0, 0),
        ProjectRewardDTO(sorted_projects[5], 0, 0),
        ProjectRewardDTO(sorted_projects[6], 0, 0),
        ProjectRewardDTO(sorted_projects[7], 0, 0),
        ProjectRewardDTO(sorted_projects[8], 0, 0),
        ProjectRewardDTO(sorted_projects[9], 0, 0),
    ]

    assert service.get_user_allocation_sum(context, user1.address) == 100
