from app.engine.projects.rewards import ProjectRewardDTO
from app.modules.dto import AllocationDTO
from app.modules.user.allocations.core import simulate_allocation
from tests.helpers.constants import USER1_ADDRESS, MATCHED_REWARDS, USER2_ADDRESS
from tests.helpers.context import get_context


def test_simulate_allocation_single_user():
    context = get_context()
    project_settings = context.epoch_settings.project
    projects = context.projects_details.projects
    # Test data
    allocations_before = [
        AllocationDTO(projects[0], 10 * 10**18, USER1_ADDRESS),
        AllocationDTO(projects[1], 20 * 10**18, USER1_ADDRESS),
        AllocationDTO(projects[2], 30 * 10**18, USER1_ADDRESS),
    ]
    user_allocation = [
        AllocationDTO(projects[0], 40 * 10**18, USER1_ADDRESS),
        AllocationDTO(projects[1], 50 * 10**18, USER1_ADDRESS),
    ]

    # Call simulate allocation method
    leverage, result = simulate_allocation(
        project_settings,
        allocations_before,
        user_allocation,
        USER1_ADDRESS,
        projects,
        MATCHED_REWARDS,
    )

    sorted_projects = sorted(projects)

    assert leverage == 2.445715536838903
    assert result == [
        ProjectRewardDTO(sorted_projects[0], 0, 0),
        ProjectRewardDTO(sorted_projects[1], 0, 0),
        ProjectRewardDTO(sorted_projects[2], 50 * 10**18, 48_914310736_778055201),
        ProjectRewardDTO(sorted_projects[3], 0, 0),
        ProjectRewardDTO(sorted_projects[4], 40 * 10**18, 61_142888420_972569002),
        ProjectRewardDTO(sorted_projects[5], 0, -110_057199157_750624203),
        ProjectRewardDTO(sorted_projects[6], 0, 0),
        ProjectRewardDTO(sorted_projects[7], 0, 0),
        ProjectRewardDTO(sorted_projects[8], 0, 0),
        ProjectRewardDTO(sorted_projects[9], 0, 0),
    ]


def test_simulate_allocation_multiple_user(proposal_accounts):
    context = get_context()
    project_settings = context.epoch_settings.project
    projects = context.projects_details.projects
    # Test data
    allocations_before = [
        AllocationDTO(proposal_accounts[0].address, 10 * 10**18, USER1_ADDRESS),
        AllocationDTO(proposal_accounts[1].address, 20 * 10**18, USER1_ADDRESS),
        AllocationDTO(proposal_accounts[2].address, 30 * 10**18, USER1_ADDRESS),
        AllocationDTO(proposal_accounts[0].address, 40 * 10**18, USER2_ADDRESS),
        AllocationDTO(proposal_accounts[1].address, 50 * 10**18, USER2_ADDRESS),
    ]
    user_allocation = [
        AllocationDTO(proposal_accounts[0].address, 60 * 10**18, USER1_ADDRESS),
        AllocationDTO(proposal_accounts[1].address, 70 * 10**18, USER1_ADDRESS),
    ]

    # Call simulate allocation method
    leverage, result = simulate_allocation(
        project_settings,
        allocations_before,
        user_allocation,
        USER1_ADDRESS,
        projects,
        MATCHED_REWARDS,
    )

    sorted_projects = sorted(projects)
    assert leverage == 1.0005199923431876
    assert result == [
        ProjectRewardDTO(sorted_projects[0], 0, 0),
        ProjectRewardDTO(sorted_projects[1], 0, 0),
        ProjectRewardDTO(sorted_projects[2], 120 * 10**18, 17_342346533_948583208),
        ProjectRewardDTO(sorted_projects[3], 0, 0),
        ProjectRewardDTO(sorted_projects[4], 100 * 10**18, 26_680533129_151666473),
        ProjectRewardDTO(sorted_projects[5], 0, -44_022879663_100249681),
        ProjectRewardDTO(sorted_projects[6], 0, 0),
        ProjectRewardDTO(sorted_projects[7], 0, 0),
        ProjectRewardDTO(sorted_projects[8], 0, 0),
        ProjectRewardDTO(sorted_projects[9], 0, 0),
    ]
