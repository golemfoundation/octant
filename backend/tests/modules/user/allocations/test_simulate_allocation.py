from app import register_epoch_settings
from app.engine.projects.rewards import ProjectRewardDTO
from app.modules.dto import AllocationDTO
from app.modules.user.allocations.core import simulate_allocation
from app.modules.common.project_rewards import AllocationsPayload
from tests.helpers.constants import USER1_ADDRESS, MATCHED_REWARDS, USER2_ADDRESS
from tests.helpers.context import get_context


def test_simulate_allocation_single_user():
    register_epoch_settings()
    context = get_context()

    project_settings = context.epoch_settings.project
    projects = context.projects_details.projects
    # Test data
    allocations_before = [
        AllocationDTO(projects[0], 10 * 10**18, user_address=USER1_ADDRESS),
        AllocationDTO(projects[1], 20 * 10**18, user_address=USER1_ADDRESS),
        AllocationDTO(projects[2], 30 * 10**18, user_address=USER1_ADDRESS),
    ]
    user_allocation = [
        AllocationDTO(projects[0], 40 * 10**18, user_address=USER1_ADDRESS),
        AllocationDTO(projects[1], 50 * 10**18, user_address=USER1_ADDRESS),
    ]

    allocations_payload = AllocationsPayload(
        before_allocations=allocations_before, user_new_allocations=user_allocation
    )
    # Call simulate allocation method
    leverage, threshold, result = simulate_allocation(
        project_settings,
        allocations_payload,
        USER1_ADDRESS,
        projects,
        MATCHED_REWARDS,
    )

    sorted_projects = sorted(projects)

    assert leverage == 2.445715536838903
    assert threshold == int(4.5 * 10**18)
    assert result == [
        ProjectRewardDTO(sorted_projects[0], 0, 0),
        ProjectRewardDTO(sorted_projects[1], 0, 0),
        ProjectRewardDTO(sorted_projects[2], 50 * 10**18, 122_285776841_945138003),
        ProjectRewardDTO(sorted_projects[3], 0, 0),
        ProjectRewardDTO(sorted_projects[4], 40 * 10**18, 97_828621473_556110403),
        ProjectRewardDTO(sorted_projects[5], 0, 0),
        ProjectRewardDTO(sorted_projects[6], 0, 0),
        ProjectRewardDTO(sorted_projects[7], 0, 0),
        ProjectRewardDTO(sorted_projects[8], 0, 0),
        ProjectRewardDTO(sorted_projects[9], 0, 0),
    ]


def test_simulate_allocation_multiple_user():
    context = get_context()
    project_settings = context.epoch_settings.project
    projects = context.projects_details.projects
    # Test data
    allocations_before = [
        AllocationDTO(projects[0], 10 * 10**18, user_address=USER1_ADDRESS),
        AllocationDTO(projects[1], 20 * 10**18, user_address=USER1_ADDRESS),
        AllocationDTO(projects[2], 30 * 10**18, user_address=USER1_ADDRESS),
        AllocationDTO(projects[0], 40 * 10**18, user_address=USER2_ADDRESS),
        AllocationDTO(projects[1], 50 * 10**18, user_address=USER2_ADDRESS),
    ]
    user_allocation = [
        AllocationDTO(projects[0], 60 * 10**18, user_address=USER1_ADDRESS),
        AllocationDTO(projects[1], 70 * 10**18, user_address=USER1_ADDRESS),
    ]

    allocations_payload = AllocationsPayload(
        before_allocations=allocations_before, user_new_allocations=user_allocation
    )
    # Call simulate allocation method
    leverage, threshold, result = simulate_allocation(
        project_settings,
        allocations_payload,
        USER1_ADDRESS,
        projects,
        MATCHED_REWARDS,
    )

    sorted_projects = sorted(projects)
    assert leverage == 1.0005199923431876
    assert threshold == 11 * 10**18
    assert result == [
        ProjectRewardDTO(sorted_projects[0], 0, 0),
        ProjectRewardDTO(sorted_projects[1], 0, 0),
        ProjectRewardDTO(sorted_projects[2], 120 * 10**18, 120_062399081_182499131),
        ProjectRewardDTO(sorted_projects[3], 0, 0),
        ProjectRewardDTO(sorted_projects[4], 100 * 10**18, 100_051999234_318749275),
        ProjectRewardDTO(sorted_projects[5], 0, 0),
        ProjectRewardDTO(sorted_projects[6], 0, 0),
        ProjectRewardDTO(sorted_projects[7], 0, 0),
        ProjectRewardDTO(sorted_projects[8], 0, 0),
        ProjectRewardDTO(sorted_projects[9], 0, 0),
    ]
