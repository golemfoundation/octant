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
    assert project_rewards[0].allocated == 1000
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
    assert project_rewards[0].allocated == 1000
    assert project_rewards[0].matched == MATCHED_REWARDS * MR_FUNDING_CAP_PERCENT


def test_compute_capped_qf_rewards_for_allocations_to_multiple_project_max_uq_score(
    projects, dataset_2_for_capped_qf_max_uq_score
):
    MATCHED_REWARDS, allocations = dataset_2_for_capped_qf_max_uq_score
    CAPPED_MF = 30666

    payload = ProjectRewardsPayload(MATCHED_REWARDS, allocations, projects[:6])
    uut = CappedQuadraticFundingProjectRewards()

    result = uut.calculate_project_rewards(payload)

    assert result.total_allocated == sum([a.amount for a in allocations])
    assert result.rewards_sum == CAPPED_MF + result.total_allocated
    assert result.threshold is None
    project_rewards = result.rewards
    assert len(project_rewards) == 6

    _check_project_reward(project_rewards[0], projects[5], 6000, 7000)
    _check_project_reward(project_rewards[1], projects[4], 5000, 7000)
    _check_project_reward(project_rewards[2], projects[3], 4000, 6666)
    _check_project_reward(project_rewards[3], projects[2], 3000, 5000)
    _check_project_reward(project_rewards[4], projects[1], 2000, 3333)
    _check_project_reward(project_rewards[5], projects[0], 1000, 1666)

    assert sum([r.matched for r in result.rewards]) == pytest.approx(CAPPED_MF, abs=1)


def test_compute_capped_qf_rewards_for_allocations_to_multiple_project_low_uq_score(
    projects, dataset_2_for_capped_qf_lower_uq_score
):
    MATCHED_REWARDS, allocations = dataset_2_for_capped_qf_lower_uq_score
    CAPPED_MF = 30666

    payload = ProjectRewardsPayload(MATCHED_REWARDS, allocations, projects[:6])
    uut = CappedQuadraticFundingProjectRewards()

    result = uut.calculate_project_rewards(payload)

    assert result.total_allocated == sum([a.amount for a in allocations])
    assert result.rewards_sum == CAPPED_MF + result.total_allocated
    assert result.threshold is None
    project_rewards = result.rewards
    assert len(project_rewards) == 6

    assert project_rewards

    _check_project_reward(project_rewards[0], projects[5], 6000, 7000)
    _check_project_reward(project_rewards[1], projects[4], 5000, 7000)
    _check_project_reward(project_rewards[2], projects[3], 4000, 6666)
    _check_project_reward(project_rewards[3], projects[2], 3000, 5000)
    _check_project_reward(project_rewards[4], projects[1], 2000, 3333)
    _check_project_reward(project_rewards[5], projects[0], 1000, 1666)

    assert sum([r.matched for r in result.rewards]) == pytest.approx(CAPPED_MF, abs=2)


def test_compute_capped_qf_rewards_for_allocations_to_multiple_project_with_many_allocations(
    projects, many_allocations_per_project_for_capped_quadratic_funding
):
    (
        MATCHED_REWARDS,
        allocations,
    ) = many_allocations_per_project_for_capped_quadratic_funding
    CAPPED_MF = 87619

    payload = ProjectRewardsPayload(MATCHED_REWARDS, allocations, projects[:6])
    uut = CappedQuadraticFundingProjectRewards()

    result = uut.calculate_project_rewards(payload)

    assert result.total_allocated == sum(
        [allocation.amount for allocation in allocations]
    )
    assert result.rewards_sum == CAPPED_MF + result.total_allocated
    assert result.threshold is None
    project_rewards = result.rewards
    assert len(project_rewards) == 6

    assert project_rewards

    _check_project_reward(project_rewards[0], projects[5], 12000, 20000)
    _check_project_reward(project_rewards[1], projects[4], 10000, 20000)
    _check_project_reward(project_rewards[2], projects[3], 8000, 19047)
    _check_project_reward(project_rewards[3], projects[2], 6000, 14285)
    _check_project_reward(project_rewards[4], projects[1], 4000, 9523)
    _check_project_reward(project_rewards[5], projects[0], 2000, 4761)

    assert sum([r.matched for r in result.rewards]) == pytest.approx(CAPPED_MF, abs=3)


def _check_project_reward(
    project_reward: ProjectRewardDTO,
    expected_address: str,
    expected_allocated: int,
    expected_matched: int,
):
    assert project_reward.address == expected_address
    assert project_reward.allocated == expected_allocated
    assert project_reward.matched == pytest.approx(expected_matched, abs=1)


def test_total_matched_rewards_are_distributed(
    projects, dataset_2_for_capped_qf_max_uq_score
):
    MATCHED_REWARDS, allocations = dataset_2_for_capped_qf_max_uq_score
    CAPPED_MF = 30666

    payload = ProjectRewardsPayload(MATCHED_REWARDS, allocations, projects)
    uut = CappedQuadraticFundingProjectRewards()

    result = uut.calculate_project_rewards(payload)

    assert sum([r.matched for r in result.rewards]) == pytest.approx(CAPPED_MF, abs=1)
