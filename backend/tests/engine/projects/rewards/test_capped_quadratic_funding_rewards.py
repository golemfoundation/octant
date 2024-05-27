from decimal import Decimal

import pytest
from _pytest.python_api import ApproxBase

from app.engine.projects import QuadraticFundingProjectRewards
from app.engine.projects.rewards import (
    ProjectRewardsPayload,
    ProjectRewardsResult,
    ProjectRewardDTO,
)
from app.engine.projects.rewards.capped_quadratic_funding import (
    CappedQuadraticFundingProjectRewards,
)
from tests.helpers.constants import MATCHED_REWARDS, MR_FUNDING_CAP_PERCENT


def test_compute_capped_qf_rewards_for_none_allocations():
    allocations = []
    payload = ProjectRewardsPayload(MATCHED_REWARDS, allocations, [])
    uut = QuadraticFundingProjectRewards()

    result = uut.calculate_project_rewards(payload)

    assert result == ProjectRewardsResult([], 0, 0, threshold=None)


def test_compute_capped_qf_rewards_for_allocations_to_one_project(
    projects, dataset_1_for_capped_quadratic_funding
):
    MATCHED_REWARDS, allocations, _ = dataset_1_for_capped_quadratic_funding

    payload = ProjectRewardsPayload(MATCHED_REWARDS, [allocations[0]], projects)
    uut = CappedQuadraticFundingProjectRewards()

    result = uut.calculate_project_rewards(payload)

    project_rewards = result.rewards
    assert len(project_rewards) == 10
    assert project_rewards[0].allocated == pytest.approx(1000, 1)
    assert project_rewards[0].matched == MATCHED_REWARDS * MR_FUNDING_CAP_PERCENT


def test_compute_capped_qf_rewards_for_allocations_to_multiple_project(
    projects, dataset_2_for_capped_quadratic_funding
):
    MATCHED_REWARDS, allocations, _ = dataset_2_for_capped_quadratic_funding

    payload = ProjectRewardsPayload(MATCHED_REWARDS, allocations, projects[:6])
    uut = CappedQuadraticFundingProjectRewards()

    result = uut.calculate_project_rewards(payload)

    assert result.total_allocated == Decimal("21000.00000000000044972661456")
    assert result.rewards_sum == MATCHED_REWARDS + int(result.total_allocated)
    assert result.threshold is None
    project_rewards = result.rewards
    assert len(project_rewards) == 6

    assert project_rewards

    _check_project_reward(project_rewards[0], projects[5], pytest.approx(6000, 1), 7000)
    _check_project_reward(project_rewards[1], projects[4], 5000, 7000)
    _check_project_reward(project_rewards[2], projects[3], pytest.approx(4000, 1), 7000)
    _check_project_reward(project_rewards[3], projects[2], 3000, 7000)
    _check_project_reward(project_rewards[4], projects[1], 2000, 4666)
    _check_project_reward(project_rewards[5], projects[0], pytest.approx(1000, 1), 2333)


def test_compute_capped_qf_rewards_for_allocations_to_multiple_project_with_many_allocations(
    projects, many_allocations_per_project_for_capped_quadratic_funding
):
    (
        MATCHED_REWARDS,
        allocations,
    ) = many_allocations_per_project_for_capped_quadratic_funding

    payload = ProjectRewardsPayload(MATCHED_REWARDS, allocations, projects[:6])
    uut = CappedQuadraticFundingProjectRewards()

    result = uut.calculate_project_rewards(payload)

    assert result.total_allocated == Decimal("84000.00000000000179890645828")
    assert result.rewards_sum == MATCHED_REWARDS + int(result.total_allocated)
    assert result.threshold is None
    project_rewards = result.rewards
    assert len(project_rewards) == 6

    assert project_rewards

    _check_project_reward(
        project_rewards[0], projects[5], pytest.approx(30000, 1), 20000
    )
    _check_project_reward(project_rewards[1], projects[4], 20000, 20000)
    _check_project_reward(
        project_rewards[2], projects[3], pytest.approx(16000, 1), 20000
    )
    _check_project_reward(project_rewards[3], projects[2], 12000, 20000)
    _check_project_reward(project_rewards[4], projects[1], 8000, 13333)
    _check_project_reward(project_rewards[5], projects[0], pytest.approx(4000, 1), 6666)


def _check_project_reward(
    project_reward: ProjectRewardDTO,
    expected_address: str,
    expected_allocated: ApproxBase | int,
    expected_matched: ApproxBase | int,
):
    assert project_reward.address == expected_address
    assert project_reward.allocated == expected_allocated
    assert project_reward.matched == expected_matched


def test_total_matched_rewards_are_distributed(
    projects, dataset_2_for_capped_quadratic_funding
):
    _, allocations, _ = dataset_2_for_capped_quadratic_funding
    payload = ProjectRewardsPayload(MATCHED_REWARDS, allocations, projects)
    uut = CappedQuadraticFundingProjectRewards()

    result = uut.calculate_project_rewards(payload)

    assert sum([r.matched for r in result.rewards]) == pytest.approx(
        MATCHED_REWARDS, 0.00000000000000000001
    )
