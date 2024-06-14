from decimal import Decimal

import pytest

from app.engine.projects.rewards import (
    ProjectRewardsPayload,
    ProjectRewardsResult,
    ProjectRewardDTO,
)
from app.engine.projects.rewards.capped_quadratic_funding import (
    CappedQuadraticFundingProjectRewards,
)
from app.engine.projects.rewards.quadratic_funding import QuadraticFundingProjectRewards
from tests.helpers.constants import (
    MATCHED_REWARDS,
    MR_FUNDING_CAP_PERCENT,
    LOW_UQ_SCORE,
)


def test_compute_capped_qf_rewards_for_none_allocations():
    allocations = []
    payload = ProjectRewardsPayload(MATCHED_REWARDS, allocations, [])
    uut = QuadraticFundingProjectRewards()

    result = uut.calculate_project_rewards(payload)

    assert result == ProjectRewardsResult([], 0, 0, threshold=None)


def test_compute_capped_qf_rewards_for_allocations_to_one_project_max_uq_score(
    projects, dataset_1_for_capped_qf_max_uq_score
):
    MATCHED_REWARDS, allocations = dataset_1_for_capped_qf_max_uq_score

    payload = ProjectRewardsPayload(MATCHED_REWARDS, [allocations[0]], projects)
    uut = CappedQuadraticFundingProjectRewards()

    result = uut.calculate_project_rewards(payload)

    project_rewards = result.rewards
    assert len(project_rewards) == 10
    assert project_rewards[0].allocated == pytest.approx(1000, 1)
    assert project_rewards[0].matched == MATCHED_REWARDS * MR_FUNDING_CAP_PERCENT


def test_compute_capped_qf_rewards_for_allocations_to_one_project_low_uq_score(
    projects, dataset_1_for_capped_qf_lower_uq_score
):
    MATCHED_REWARDS, allocations = dataset_1_for_capped_qf_lower_uq_score

    payload = ProjectRewardsPayload(MATCHED_REWARDS, [allocations[0]], projects)
    uut = CappedQuadraticFundingProjectRewards()

    result = uut.calculate_project_rewards(payload)

    project_rewards = result.rewards
    assert len(project_rewards) == 10
    assert project_rewards[0].allocated == pytest.approx(LOW_UQ_SCORE * 1000, abs=1)
    assert project_rewards[0].matched == MATCHED_REWARDS * MR_FUNDING_CAP_PERCENT


def test_compute_capped_qf_rewards_for_allocations_to_multiple_project_max_uq_score(
    projects, dataset_2_for_capped_qf_max_uq_score
):
    MATCHED_REWARDS, allocations = dataset_2_for_capped_qf_max_uq_score

    payload = ProjectRewardsPayload(MATCHED_REWARDS, allocations, projects[:6])
    uut = CappedQuadraticFundingProjectRewards()

    result = uut.calculate_project_rewards(payload)

    assert result.total_allocated == 21000
    assert result.rewards_sum == MATCHED_REWARDS + int(result.total_allocated)
    assert result.threshold is None
    project_rewards = result.rewards
    assert len(project_rewards) == 6

    assert project_rewards

    _check_project_reward(project_rewards[0], projects[5], 6000, 7000)
    _check_project_reward(project_rewards[1], projects[4], 5000, 7000)
    _check_project_reward(project_rewards[2], projects[3], 4000, 7000)
    _check_project_reward(project_rewards[3], projects[2], 3000, 7000)
    _check_project_reward(project_rewards[4], projects[1], 2000, 4666)
    _check_project_reward(project_rewards[5], projects[0], 1000, 2333)


def test_compute_capped_qf_rewards_for_allocations_to_multiple_project_low_uq_score(
    projects, dataset_2_for_capped_qf_lower_uq_score
):
    MATCHED_REWARDS, allocations = dataset_2_for_capped_qf_lower_uq_score

    payload = ProjectRewardsPayload(MATCHED_REWARDS, allocations, projects[:6])
    uut = CappedQuadraticFundingProjectRewards()

    result = uut.calculate_project_rewards(payload)

    assert result.total_allocated == pytest.approx(
        Decimal("21000.00000000000044972661456") * Decimal(LOW_UQ_SCORE), abs=1
    )
    assert result.rewards_sum == MATCHED_REWARDS + int(result.total_allocated)
    assert result.threshold is None
    project_rewards = result.rewards
    assert len(project_rewards) == 6

    assert project_rewards

    _check_project_reward(project_rewards[0], projects[5], 6000 * LOW_UQ_SCORE, 7000)
    _check_project_reward(project_rewards[1], projects[4], 5000 * LOW_UQ_SCORE, 7000)
    _check_project_reward(project_rewards[2], projects[3], 4000 * LOW_UQ_SCORE, 7000)
    _check_project_reward(project_rewards[3], projects[2], 3000 * LOW_UQ_SCORE, 7000)
    _check_project_reward(project_rewards[4], projects[1], 2000 * LOW_UQ_SCORE, 4666)
    _check_project_reward(project_rewards[5], projects[0], 1000 * LOW_UQ_SCORE, 2333)


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

    assert result.total_allocated == 84000
    assert result.rewards_sum == MATCHED_REWARDS + int(result.total_allocated)
    assert result.threshold is None
    project_rewards = result.rewards
    assert len(project_rewards) == 6

    assert project_rewards

    _check_project_reward(project_rewards[0], projects[5], 23999, 20000)
    _check_project_reward(project_rewards[1], projects[4], 20000, 20000)
    _check_project_reward(project_rewards[2], projects[3], 16000, 20000)
    _check_project_reward(project_rewards[3], projects[2], 12000, 20000)
    _check_project_reward(project_rewards[4], projects[1], 8000, 13333)
    _check_project_reward(project_rewards[5], projects[0], 4000, 6666)


def _check_project_reward(
    project_reward: ProjectRewardDTO,
    expected_address: str,
    expected_allocated: int,
    expected_matched: int,
):
    assert project_reward.address == expected_address
    assert project_reward.allocated == pytest.approx(expected_allocated, abs=1)
    assert project_reward.matched == pytest.approx(expected_matched, abs=1)


def test_total_matched_rewards_are_distributed(
    projects, dataset_2_for_capped_qf_max_uq_score
):
    MATCHED_REWARDS, allocations = dataset_2_for_capped_qf_max_uq_score
    payload = ProjectRewardsPayload(MATCHED_REWARDS, allocations, projects)
    uut = CappedQuadraticFundingProjectRewards()

    result = uut.calculate_project_rewards(payload)

    assert sum([r.matched for r in result.rewards]) == pytest.approx(
        MATCHED_REWARDS, abs=1
    )
