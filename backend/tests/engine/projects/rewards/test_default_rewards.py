import pytest

from app.engine.projects import DefaultProjectRewards
from app.engine.projects.rewards import (
    ProjectRewardsPayload,
    ProjectRewardDTO,
    AllocationPayload,
)
from tests.helpers.context import get_project_details

MATCHED_REWARDS = 100_000000000_000000000


def test_compute_rewards_for_none_allocations():
    allocations = []
    payload = ProjectRewardsPayload(MATCHED_REWARDS, allocations, [])
    uut = DefaultProjectRewards()

    result = uut.calculate_project_rewards(payload)

    assert result == ([], 0, 0)


def test_compute_rewards_for_allocations_to_one_project():
    projects = get_project_details().projects
    allocations = [AllocationPayload(projects[0], 100_000000000)]
    payload = ProjectRewardsPayload(MATCHED_REWARDS, allocations, projects)
    uut = DefaultProjectRewards()

    result = uut.calculate_project_rewards(payload)

    project_rewards = result[0]
    assert len(project_rewards) == 10
    assert project_rewards[0] == ProjectRewardDTO(
        projects[0], 100000000000, 100000000000000000000
    )
    for project in project_rewards[1:]:
        assert project.allocated == 0
        assert project.matched == 0

    assert result[1] == pytest.approx(
        MATCHED_REWARDS + 100_000000000, 0.00000000000000000001
    )


def test_compute_rewards_for_allocations_to_multiple_project():
    projects = get_project_details().projects
    allocations = [
        AllocationPayload(projects[0], 100_000000000),
        AllocationPayload(projects[0], 100_000000000),
        AllocationPayload(projects[1], 200_000000000),
        AllocationPayload(projects[2], 500_000000000),
    ]
    payload = ProjectRewardsPayload(MATCHED_REWARDS, allocations, projects)
    uut = DefaultProjectRewards()

    result = uut.calculate_project_rewards(payload)

    project_rewards = result[0]
    assert len(project_rewards) == 10
    assert project_rewards[0] == ProjectRewardDTO(
        projects[2], 500_000000000, 55555555555555555555
    )
    assert project_rewards[1] == ProjectRewardDTO(
        projects[0], 200_000000000, 22222222222222222222
    )
    assert project_rewards[2] == ProjectRewardDTO(
        projects[1], 200_000000000, 22222222222222222222
    )

    for project in project_rewards[3:]:
        assert project.allocated == 0
        assert project.matched == 0

    assert result[1] == pytest.approx(
        MATCHED_REWARDS + 500_000000000 + 200_000000000 + 200_000000000,
        0.00000000000000000001,
    )


def test_total_matched_rewards_are_distributed():
    projects = get_project_details().projects
    allocations = [
        AllocationPayload(projects[0], 200_000000000),
        AllocationPayload(projects[1], 200_000000000),
        AllocationPayload(projects[2], 500_000000000),
    ]
    payload = ProjectRewardsPayload(MATCHED_REWARDS, allocations, projects)
    uut = DefaultProjectRewards()

    result = uut.calculate_project_rewards(payload)

    assert sum([r.matched for r in result[0]]) == pytest.approx(
        MATCHED_REWARDS, 0.00000000000000000001
    )


def test_compute_rewards_when_one_project_is_below_threshold():
    projects = get_project_details().projects

    allocations = [
        AllocationPayload(projects[0], 69_000000000),
        AllocationPayload(projects[1], 200_000000000),
        AllocationPayload(projects[2], 500_000000000),
    ]
    payload = ProjectRewardsPayload(MATCHED_REWARDS, allocations, projects[:5])
    uut = DefaultProjectRewards()

    result = uut.calculate_project_rewards(payload)

    project_rewards = result[0]
    assert len(project_rewards) == 5
    assert project_rewards[0] == ProjectRewardDTO(
        projects[2], 500_000000000, 71428571428571428571
    )
    assert project_rewards[1] == ProjectRewardDTO(
        projects[1], 200_000000000, 28571428571428571428
    )
    assert project_rewards[2] == ProjectRewardDTO(projects[0], 69_000000000, 0)
    assert result[1] == pytest.approx(
        MATCHED_REWARDS + 500_000000000 + 200_000000000, 0.00000000000000000001
    )


def test_compute_rewards_when_multiple_projects_are_below_threshold():
    projects = get_project_details().projects

    allocations = [
        AllocationPayload(projects[0], 30_000000000),
        AllocationPayload(projects[1], 30_000000000),
        AllocationPayload(projects[2], 500_000000000),
    ]
    payload = ProjectRewardsPayload(MATCHED_REWARDS, allocations, projects[:5])
    uut = DefaultProjectRewards()

    result = uut.calculate_project_rewards(payload)

    project_rewards = result[0]
    assert len(result[0]) == 5
    assert project_rewards[0] == ProjectRewardDTO(
        projects[2], 500_000000000, 100000000000000000000
    )
    assert project_rewards[1] == ProjectRewardDTO(projects[0], 30_000000000, 0)
    assert project_rewards[2] == ProjectRewardDTO(projects[1], 30_000000000, 0)
    assert result[1] == pytest.approx(
        MATCHED_REWARDS + 500_000000000, 0.00000000000000000001
    )


def test_total_allocated_is_computed():
    projects = get_project_details().projects

    allocations = [
        AllocationPayload(projects[0], 300_000000000),
        AllocationPayload(projects[0], 300_000000000),
        AllocationPayload(projects[1], 200_000000000),
        AllocationPayload(projects[2], 500_000000000),
    ]
    payload = ProjectRewardsPayload(MATCHED_REWARDS, allocations, projects[:5])
    uut = DefaultProjectRewards()

    result = uut.calculate_project_rewards(payload)

    assert result[2] == 1300_000000000
