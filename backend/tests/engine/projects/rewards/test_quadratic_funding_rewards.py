from decimal import Decimal

import pytest

from app.engine.projects.rewards.quadratic_funding import QuadraticFundingProjectRewards
from app.engine.projects.rewards import (
    ProjectRewardsPayload,
    ProjectRewardsResult,
    ProjectRewardDTO,
)
from tests.helpers.constants import MATCHED_REWARDS


def test_compute_qf_rewards_for_none_allocations():
    allocations = []
    payload = ProjectRewardsPayload(MATCHED_REWARDS, allocations, [])
    uut = QuadraticFundingProjectRewards()

    result = uut.calculate_project_rewards(payload)

    assert result == ProjectRewardsResult([], 0, 0, threshold=None)


def test_compute_qf_rewards_for_allocations_to_one_project(
    projects, data_for_qf_max_uq_score
):
    allocations, MATCHED_REWARDS = data_for_qf_max_uq_score

    payload = ProjectRewardsPayload(MATCHED_REWARDS, [allocations[0]], projects)
    uut = QuadraticFundingProjectRewards()

    result = uut.calculate_project_rewards(payload)

    project_rewards = result.rewards
    assert len(project_rewards) == 10
    assert project_rewards[0] == ProjectRewardDTO(
        address=projects[0], allocated=100, matched=MATCHED_REWARDS
    )


def test_compute_qf_rewards_for_allocations_to_multiple_project(
    projects, data_for_qf_max_uq_score
):
    allocations, MATCHED_REWARDS = data_for_qf_max_uq_score

    payload = ProjectRewardsPayload(MATCHED_REWARDS, allocations, projects)
    uut = QuadraticFundingProjectRewards()

    result = uut.calculate_project_rewards(payload)
    assert result.total_allocated == Decimal("24356.29135849481011578840500")
    assert result.rewards_sum == int(MATCHED_REWARDS + result.total_allocated)
    assert result.threshold is None

    project_rewards = result.rewards
    assert len(project_rewards) == 10
    assert project_rewards[0] == ProjectRewardDTO(
        address=projects[1], allocated=16355, matched=23503
    )
    assert project_rewards[1] == ProjectRewardDTO(
        address=projects[0], allocated=7026, matched=10096
    )
    assert project_rewards[2] == ProjectRewardDTO(
        address=projects[2], allocated=974, matched=1400
    )

    for project in project_rewards[3:]:
        assert project.allocated == 0
        assert project.matched == 0


def test_total_matched_rewards_are_distributed(projects, data_for_qf_max_uq_score):
    allocations, _ = data_for_qf_max_uq_score
    payload = ProjectRewardsPayload(MATCHED_REWARDS, allocations, projects)
    uut = QuadraticFundingProjectRewards()

    result = uut.calculate_project_rewards(payload)

    assert sum([r.matched for r in result.rewards]) == pytest.approx(
        MATCHED_REWARDS, 0.00000000000000000001
    )
