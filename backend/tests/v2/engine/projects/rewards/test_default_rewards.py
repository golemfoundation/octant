import pytest

from app.core.common import AccountFunds
from app.v2.engine.projects import DefaultProjectRewards
from app.v2.engine.projects.rewards import ProjectRewardsPayload

THRESHOLD = 100_000000000
MATCHED_REWARDS = 100_000000000_000000000


def test_compute_rewards_for_none_allocations():
    allocated = []
    payload = ProjectRewardsPayload(MATCHED_REWARDS, allocated, 0)
    uut = DefaultProjectRewards()

    result = uut.calculate_project_rewards(payload)

    assert result == ([], 0)


def test_compute_rewards_for_allocations_to_one_project(proposal_addresses):
    allocated = [(proposal_addresses[0], 100_000000000)]
    payload = ProjectRewardsPayload(MATCHED_REWARDS, allocated, THRESHOLD)
    uut = DefaultProjectRewards()

    result = uut.calculate_project_rewards(payload)

    assert len(result[0]) == 1
    assert result[0] == [
        AccountFunds(
            proposal_addresses[0], 100000000100000000000, 100000000000000000000
        )
    ]
    assert result[1] == pytest.approx(
        MATCHED_REWARDS + 100_000000000, 0.00000000000000000001
    )


def test_compute_rewards_for_allocations_to_multiple_project(proposal_addresses):
    allocated = [
        (proposal_addresses[0], 200_000000000),
        (proposal_addresses[1], 200_000000000),
        (proposal_addresses[2], 500_000000000),
    ]
    payload = ProjectRewardsPayload(MATCHED_REWARDS, allocated, THRESHOLD)
    uut = DefaultProjectRewards()

    result = uut.calculate_project_rewards(payload)

    assert len(result[0]) == 3
    assert result[0] == [
        AccountFunds(proposal_addresses[2], 55555556055555555555, 55555555555555555555),
        AccountFunds(proposal_addresses[0], 22222222422222222222, 22222222222222222222),
        AccountFunds(proposal_addresses[1], 22222222422222222222, 22222222222222222222),
    ]
    assert result[1] == pytest.approx(
        MATCHED_REWARDS + 500_000000000 + 200_000000000 + 200_000000000,
        0.00000000000000000001,
    )


def test_total_matched_rewards_are_distributed(proposal_addresses):
    allocated = [
        (proposal_addresses[0], 200_000000000),
        (proposal_addresses[1], 200_000000000),
        (proposal_addresses[2], 500_000000000),
    ]
    payload = ProjectRewardsPayload(MATCHED_REWARDS, allocated, THRESHOLD)
    uut = DefaultProjectRewards()

    result = uut.calculate_project_rewards(payload)

    assert sum([r.matched for r in result[0]]) == pytest.approx(
        MATCHED_REWARDS, 0.00000000000000000001
    )


def test_compute_rewards_when_one_project_is_below_threshold(proposal_addresses):
    allocated = [
        (proposal_addresses[0], 99_000000000),
        (proposal_addresses[1], 200_000000000),
        (proposal_addresses[2], 500_000000000),
    ]
    payload = ProjectRewardsPayload(MATCHED_REWARDS, allocated, THRESHOLD)
    uut = DefaultProjectRewards()

    result = uut.calculate_project_rewards(payload)

    assert len(result[0]) == 2
    assert result[0] == [
        AccountFunds(proposal_addresses[2], 71428571928571428571, 71428571428571428571),
        AccountFunds(proposal_addresses[1], 28571428771428571428, 28571428571428571428),
    ]
    assert result[1] == pytest.approx(
        MATCHED_REWARDS + 500_000000000 + 200_000000000, 0.00000000000000000001
    )


def test_compute_rewards_when_multiple_projects_are_below_threshold(proposal_addresses):
    allocated = [
        (proposal_addresses[0], 99_000000000),
        (proposal_addresses[1], 30_000000000),
        (proposal_addresses[2], 500_000000000),
    ]
    payload = ProjectRewardsPayload(MATCHED_REWARDS, allocated, THRESHOLD)
    uut = DefaultProjectRewards()

    result = uut.calculate_project_rewards(payload)

    assert len(result[0]) == 1
    assert result[0] == [
        AccountFunds(
            proposal_addresses[2], 100000000500000000000, 100000000000000000000
        ),
    ]
    assert result[1] == pytest.approx(
        MATCHED_REWARDS + 500_000000000, 0.00000000000000000001
    )
